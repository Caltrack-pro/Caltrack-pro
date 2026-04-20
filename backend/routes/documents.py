"""
Documents API
==============
GET    /api/documents                         List all documents for the site
POST   /api/documents                         Create a new document with optional instrument links
PUT    /api/documents/{id}                    Update document metadata and linked instruments
DELETE /api/documents/{id}                    Delete a document and its links
GET    /api/documents/by-instrument/{instrument_id}  List documents linked to an instrument
"""
from __future__ import annotations

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import UserContext, assert_writable_site, get_current_user, resolve_site
from database import get_db
from models import Document, DocumentInstrument, Instrument
from schemas import (
    DocumentCreate,
    DocumentListResponse,
    DocumentResponse,
    DocumentUpdate,
)

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _document_response(doc: Document, db: Session) -> DocumentResponse:
    """Convert a Document ORM object to DocumentResponse with instrument_ids populated."""
    links = db.query(DocumentInstrument).filter(
        DocumentInstrument.document_id == doc.id
    ).all()
    instrument_ids = [link.instrument_id for link in links]
    return DocumentResponse(
        id=doc.id,
        site_name=doc.site_name,
        title=doc.title,
        doc_type=doc.doc_type,
        file_name=doc.file_name,
        file_size=doc.file_size,
        file_url=doc.file_url,
        notes=doc.notes,
        uploaded_by=doc.uploaded_by,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        instrument_ids=instrument_ids,
    )


# ---------------------------------------------------------------------------
# GET /api/documents
# ---------------------------------------------------------------------------

@router.get("", response_model=DocumentListResponse)
def list_documents(
    site: str = Depends(resolve_site),
    db: Session = Depends(get_db),
) -> DocumentListResponse:

    docs = (
        db.query(Document)
        .filter(Document.site_name == site)
        .order_by(Document.created_at.desc())
        .all()
    )

    results = [_document_response(doc, db) for doc in docs]
    return DocumentListResponse(total=len(results), results=results)


# ---------------------------------------------------------------------------
# POST /api/documents
# ---------------------------------------------------------------------------

@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(
    payload: DocumentCreate,
    current_user: UserContext = Depends(get_current_user),
    site: str = Depends(resolve_site),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    assert_writable_site(current_user)

    # Verify all instrument IDs belong to this site (if provided)
    if payload.instrument_ids:
        existing_instrs = db.query(Instrument).filter(
            Instrument.id.in_(payload.instrument_ids),
            Instrument.created_by == site,
        ).all()
        if len(existing_instrs) != len(payload.instrument_ids):
            raise HTTPException(
                status_code=400,
                detail="One or more instruments not found or don't belong to this site"
            )

    doc = Document(
        site_name=site,
        title=payload.title,
        doc_type=payload.doc_type,
        file_name=payload.file_name,
        file_size=payload.file_size,
        file_url=payload.file_url,
        notes=payload.notes,
        uploaded_by=current_user.display_name or current_user.email or "Unknown",
    )
    db.add(doc)
    db.flush()  # Flush to get the doc.id without committing yet

    # Create instrument links
    if payload.instrument_ids:
        for instr_id in payload.instrument_ids:
            link = DocumentInstrument(
                document_id=doc.id,
                instrument_id=instr_id,
            )
            db.add(link)

    db.commit()
    db.refresh(doc)

    return _document_response(doc, db)


# ---------------------------------------------------------------------------
# PUT /api/documents/{id}
# ---------------------------------------------------------------------------

@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(
    doc_id: UUID,
    payload: DocumentUpdate,
    current_user: UserContext = Depends(get_current_user),
    site: str = Depends(resolve_site),
    db: Session = Depends(get_db),
) -> DocumentResponse:
    assert_writable_site(current_user)

    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.site_name == site,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Update fields
    if payload.title is not None:
        doc.title = payload.title
    if payload.doc_type is not None:
        doc.doc_type = payload.doc_type
    if payload.file_name is not None:
        doc.file_name = payload.file_name
    if payload.file_size is not None:
        doc.file_size = payload.file_size
    if payload.file_url is not None:
        doc.file_url = payload.file_url
    if payload.notes is not None:
        doc.notes = payload.notes

    # Update instrument links if provided
    if payload.instrument_ids is not None:
        # Verify all instruments belong to this site
        existing_instrs = db.query(Instrument).filter(
            Instrument.id.in_(payload.instrument_ids),
            Instrument.created_by == site,
        ).all()
        if len(existing_instrs) != len(payload.instrument_ids):
            raise HTTPException(
                status_code=400,
                detail="One or more instruments not found or don't belong to this site"
            )

        # Delete old links and create new ones
        db.query(DocumentInstrument).filter(
            DocumentInstrument.document_id == doc_id
        ).delete(synchronize_session=False)

        for instr_id in payload.instrument_ids:
            link = DocumentInstrument(
                document_id=doc_id,
                instrument_id=instr_id,
            )
            db.add(link)

    db.commit()
    db.refresh(doc)

    return _document_response(doc, db)


# ---------------------------------------------------------------------------
# DELETE /api/documents/{id}
# ---------------------------------------------------------------------------

@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_document(
    doc_id: UUID,
    current_user: UserContext = Depends(get_current_user),
    site: str = Depends(resolve_site),
    db: Session = Depends(get_db),
) -> None:
    assert_writable_site(current_user)

    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.site_name == site,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    db.query(DocumentInstrument).filter(
        DocumentInstrument.document_id == doc_id
    ).delete(synchronize_session=False)
    db.delete(doc)
    db.commit()


# ---------------------------------------------------------------------------
# GET /api/documents/by-instrument/{instrument_id}
# ---------------------------------------------------------------------------

@router.get("/by-instrument/{instrument_id}", response_model=DocumentListResponse)
def list_documents_by_instrument(
    instrument_id: UUID,
    site: str = Depends(resolve_site),
    db: Session = Depends(get_db),
) -> DocumentListResponse:

    # Verify instrument belongs to this site
    instr = db.query(Instrument).filter(
        Instrument.id == instrument_id,
        Instrument.created_by == site,
    ).first()
    if not instr:
        raise HTTPException(status_code=404, detail="Instrument not found")

    # Find all documents linked to this instrument
    links = db.query(DocumentInstrument).filter(
        DocumentInstrument.instrument_id == instrument_id
    ).all()

    doc_ids = [link.document_id for link in links]
    if not doc_ids:
        return DocumentListResponse(total=0, results=[])

    docs = db.query(Document).filter(
        Document.id.in_(doc_ids),
        Document.site_name == site,
    ).order_by(Document.created_at.desc()).all()

    results = [_document_response(doc, db) for doc in docs]
    return DocumentListResponse(total=len(results), results=results)
