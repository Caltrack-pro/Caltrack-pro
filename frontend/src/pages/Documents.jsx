import { useState, useEffect, useCallback, useMemo } from 'react'
import { documents as docsApi, instruments as instrApi } from '../utils/api'
import { getUser } from '../utils/userContext'
import { Toast } from '../components/Toast'

/**
 * Documents.jsx — Calibration procedures, manuals, and certificates library
 * Users can upload metadata about documents and link them to instruments.
 */

const DOC_TYPE_COLORS = {
  procedure: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Procedure' },
  manual: { bg: 'bg-green-100', text: 'text-green-800', label: 'Manual' },
  certificate: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Certificate' },
  other: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Other' },
}

function Documents() {
  const user = getUser()
  const [documents, setDocuments] = useState([])
  const [instruments, setInstruments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Modal/form state
  const [showForm, setShowForm] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    doc_type: 'procedure',
    file_name: '',
    notes: '',
    instrument_ids: [],
  })
  const [formLoading, setFormLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Fetch documents and instruments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [docsRes, instrsRes] = await Promise.all([
          docsApi.list(),
          instrApi.list({ status: 'active', limit: 500 }),
        ])
        setDocuments(docsRes.documents || [])
        setInstruments(instrsRes.instruments || [])
      } catch (err) {
        setError(err.message)
        setToast({ type: 'error', message: `Failed to load documents: ${err.message}` })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Open form for new or edit
  const handleOpenForm = useCallback((doc = null) => {
    if (doc) {
      setEditingDoc(doc)
      setFormData({
        title: doc.title,
        doc_type: doc.doc_type,
        file_name: doc.file_name,
        notes: doc.notes || '',
        instrument_ids: doc.instrument_ids || [],
      })
    } else {
      setEditingDoc(null)
      setFormData({
        title: '',
        doc_type: 'procedure',
        file_name: '',
        notes: '',
        instrument_ids: [],
      })
    }
    setShowForm(true)
  }, [])

  // Close form
  const handleCloseForm = useCallback(() => {
    setShowForm(false)
    setEditingDoc(null)
    setFormData({
      title: '',
      doc_type: 'procedure',
      file_name: '',
      notes: '',
      instrument_ids: [],
    })
  }, [])

  // Handle form input change
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Handle instrument multi-select
  const handleInstrumentToggle = useCallback((instrumentId) => {
    setFormData((prev) => {
      const ids = prev.instrument_ids || []
      return {
        ...prev,
        instrument_ids: ids.includes(instrumentId)
          ? ids.filter((id) => id !== instrumentId)
          : [...ids, instrumentId],
      }
    })
  }, [])

  // Save document (create or update)
  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        setToast({ type: 'error', message: 'Title is required' })
        return
      }

      setFormLoading(true)
      let response
      if (editingDoc) {
        response = await docsApi.update(editingDoc.id, formData)
        setDocuments((prev) =>
          prev.map((d) => (d.id === editingDoc.id ? response : d))
        )
        setToast({ type: 'success', message: 'Document updated' })
      } else {
        response = await docsApi.create(formData)
        setDocuments((prev) => [...prev, response])
        setToast({ type: 'success', message: 'Document created' })
      }
      handleCloseForm()
    } catch (err) {
      setToast({ type: 'error', message: `Failed to save: ${err.message}` })
    } finally {
      setFormLoading(false)
    }
  }

  // Delete document (with confirmation)
  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await docsApi.delete(deleteConfirm.id)
      setDocuments((prev) => prev.filter((d) => d.id !== deleteConfirm.id))
      setToast({ type: 'success', message: 'Document deleted' })
      setDeleteConfirm(null)
    } catch (err) {
      setToast({ type: 'error', message: `Failed to delete: ${err.message}` })
    }
  }

  // Get instrument tag numbers for a document
  const getInstrumentTags = useCallback((instrumentIds = []) => {
    if (!instrumentIds || instrumentIds.length === 0) return '—'
    return instruments
      .filter((i) => instrumentIds.includes(i.id))
      .map((i) => i.tag_number)
      .join(', ')
  }, [instruments])

  // Get badge colors for doc type
  const getTypeStyles = (docType) => {
    return DOC_TYPE_COLORS[docType] || DOC_TYPE_COLORS.other
  }

  const typeStyles = (docType) => getTypeStyles(docType)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📁 Documents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload and manage calibration procedures, manuals, and certificates.
          </p>
        </div>
        {!user?.isDemoMode && (
          <button
            onClick={() => handleOpenForm()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            + Upload Document
          </button>
        )}
      </div>

      {/* Demo mode notice */}
      {user?.isDemoMode && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
          <p className="text-sm text-amber-800">
            Demo mode: Document management is read-only.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {documents.length === 0 && !error && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-slate-600">No documents yet.</p>
          {!user?.isDemoMode && (
            <button
              onClick={() => handleOpenForm()}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Create your first document
            </button>
          )}
        </div>
      )}

      {/* Documents table */}
      {documents.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-900">
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">
                  File Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">
                  Linked Instruments
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">
                  Uploaded By
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-white/80 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const ts = typeStyles(doc.doc_type)
                const uploadedDate = doc.created_at
                  ? new Date(doc.created_at).toLocaleDateString('en-AU')
                  : '—'
                return (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-200 hover:bg-slate-50 transition"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {doc.title}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ts.bg} ${ts.text}`}
                      >
                        {ts.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {doc.file_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {getInstrumentTags(doc.instrument_ids)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {doc.created_by || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {uploadedDate}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      {!user?.isDemoMode && (
                        <>
                          <button
                            onClick={() => handleOpenForm(doc)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(doc)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {user?.isDemoMode && (
                        <span className="text-slate-400 text-xs">View only</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Document Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editingDoc ? 'Edit Document' : 'New Document'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Pressure Transmitter XYZ Procedure"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  name="doc_type"
                  value={formData.doc_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="procedure">Procedure</option>
                  <option value="manual">Manual</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* File Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  name="file_name"
                  value={formData.file_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Procedure_XYZ_v2.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Metadata reference to your locally stored document
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Link to Instruments */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Link to Instruments
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-300 rounded-lg p-3 bg-slate-50">
                  {instruments.length === 0 ? (
                    <p className="text-sm text-slate-500">No active instruments found</p>
                  ) : (
                    <div className="space-y-2">
                      {instruments.map((instr) => (
                        <label key={instr.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.instrument_ids.includes(instr.id)}
                            onChange={() => handleInstrumentToggle(instr.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-700">
                            {instr.tag_number} — {instr.description}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-slate-200 p-6 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseForm}
                disabled={formLoading}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={formLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {formLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900">Delete Document?</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-600">
                Are you sure you want to delete <strong>{deleteConfirm.title}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="border-t border-slate-200 p-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Documents
