"""
Billing routes — Stripe Checkout, webhooks, customer portal, subscription status
================================================================================
POST /api/billing/create-checkout-session   → redirect URL for Stripe Checkout
POST /api/billing/create-portal-session     → redirect URL for Stripe Customer Portal
GET  /api/billing/subscription              → current subscription details for the site
POST /api/billing/webhook                   → Stripe webhook receiver (no auth — signature verified)
"""
from __future__ import annotations

import hashlib
import hmac
import logging
import os
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import UserContext, get_current_user
from database import get_db
from models import Site

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/billing", tags=["billing"])

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

STRIPE_SECRET_KEY      = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET  = os.getenv("STRIPE_WEBHOOK_SECRET", "")
APP_URL                = os.getenv("APP_URL", "https://calcheq.com")

stripe.api_key = STRIPE_SECRET_KEY

# Price ID map — sandbox values (replace with live keys for production)
PRICE_MAP = {
    "starter_month":        "price_1TMZiHCMuZPI8s0maMKcFOjC",
    "starter_year":         "price_1TMZiICMuZPI8s0mOMAdEphF",
    "professional_month":   "price_1TMZiKCMuZPI8s0mJTZeAXd6",
    "professional_year":    "price_1TMZiLCMuZPI8s0mb2WfQE7t",
    "enterprise_month":     "price_1TMZiNCMuZPI8s0mAuuMqELL",
    "enterprise_year":      "price_1TMZiOCMuZPI8s0mZLuhfHFu",
}

PLAN_FROM_PRODUCT = {
    "prod_ULFonbTdcyxDUS": "starter",
    "prod_ULFoborT7qGhoA": "professional",
    "prod_ULFplYpi6ymvkI": "enterprise",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_or_create_stripe_customer(site: Site, email: str, db: Session) -> str:
    """Return existing Stripe customer ID or create one and persist it."""
    if site.stripe_customer_id:
        return site.stripe_customer_id

    customer = stripe.Customer.create(
        email=email,
        name=site.name,
        metadata={"site_id": str(site.id), "site_name": site.name},
    )
    site.stripe_customer_id = customer.id
    db.commit()
    return customer.id


# ---------------------------------------------------------------------------
# POST /api/billing/create-checkout-session
# ---------------------------------------------------------------------------

class CheckoutRequest(BaseModel):
    plan: str       # starter / professional / enterprise
    interval: str   # month / year


@router.post("/create-checkout-session")
def create_checkout_session(
    payload: CheckoutRequest,
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe is not configured.")

    price_key = f"{payload.plan}_{payload.interval}"
    price_id = PRICE_MAP.get(price_key)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"Invalid plan/interval: {price_key}")

    site = db.query(Site).filter(Site.name == current_user.site_name).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    customer_id = _get_or_create_stripe_customer(site, current_user.email, db)

    # Don't allow creating a new checkout if already actively subscribed
    if site.subscription_status == "active" and site.stripe_subscription_id:
        raise HTTPException(
            status_code=409,
            detail="You already have an active subscription. Use the billing portal to change plans.",
        )

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=f"{APP_URL}/app/settings?billing=success&session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{APP_URL}/app/settings?billing=cancelled",
        subscription_data={
            "trial_period_days": 30,
            "metadata": {"site_id": str(site.id), "site_name": site.name},
        },
        metadata={"site_id": str(site.id), "site_name": site.name},
    )

    return {"url": session.url}


# ---------------------------------------------------------------------------
# POST /api/billing/create-portal-session
# ---------------------------------------------------------------------------

@router.post("/create-portal-session")
def create_portal_session(
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe is not configured.")

    site = db.query(Site).filter(Site.name == current_user.site_name).first()
    if not site or not site.stripe_customer_id:
        raise HTTPException(status_code=404, detail="No billing account found. Subscribe to a plan first.")

    session = stripe.billing_portal.Session.create(
        customer=site.stripe_customer_id,
        return_url=f"{APP_URL}/app/settings",
    )

    return {"url": session.url}


# ---------------------------------------------------------------------------
# GET /api/billing/subscription
# ---------------------------------------------------------------------------

@router.get("/subscription")
def get_subscription(
    current_user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    site = db.query(Site).filter(Site.name == current_user.site_name).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")

    return {
        "subscription_status":      site.subscription_status,
        "subscription_plan":        site.subscription_plan,
        "subscription_interval":    site.subscription_interval,
        "trial_ends_at":            site.trial_ends_at.isoformat() if site.trial_ends_at else None,
        "current_period_end":       site.subscription_current_period_end.isoformat() if site.subscription_current_period_end else None,
        "stripe_customer_id":       site.stripe_customer_id,
        "has_subscription":         site.stripe_subscription_id is not None,
    }


# ---------------------------------------------------------------------------
# POST /api/billing/webhook  — Stripe event receiver
# ---------------------------------------------------------------------------

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Receives Stripe webhook events. Verifies the signature, then updates
    the local sites table to reflect subscription status changes.
    """
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook secret not configured.")

    body = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(body, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event["type"]
    data = event["data"]["object"]

    db = next(get_db())
    try:
        if event_type == "checkout.session.completed":
            _handle_checkout_completed(data, db)
        elif event_type == "customer.subscription.created":
            _handle_subscription_update(data, db)
        elif event_type == "customer.subscription.updated":
            _handle_subscription_update(data, db)
        elif event_type == "customer.subscription.deleted":
            _handle_subscription_deleted(data, db)
        elif event_type == "invoice.payment_failed":
            _handle_payment_failed(data, db)
        else:
            logger.debug("Unhandled Stripe event: %s", event_type)
    finally:
        db.close()

    return {"received": True}


# ---------------------------------------------------------------------------
# Webhook handlers
# ---------------------------------------------------------------------------

def _find_site_by_customer(customer_id: str, db: Session) -> Site | None:
    return db.query(Site).filter(Site.stripe_customer_id == customer_id).first()


def _find_site_by_metadata(metadata: dict, db: Session) -> Site | None:
    """Try to find site via metadata.site_id or metadata.site_name."""
    site_id = metadata.get("site_id")
    if site_id:
        site = db.query(Site).filter(Site.id == site_id).first()
        if site:
            return site
    site_name = metadata.get("site_name")
    if site_name:
        return db.query(Site).filter(Site.name == site_name).first()
    return None


def _handle_checkout_completed(session_data: dict, db: Session):
    """Link Stripe subscription to site after first checkout."""
    site = _find_site_by_metadata(session_data.get("metadata", {}), db)
    if not site:
        site = _find_site_by_customer(session_data.get("customer"), db)
    if not site:
        logger.warning("checkout.session.completed: no site found for session %s", session_data.get("id"))
        return

    sub_id = session_data.get("subscription")
    if sub_id and not site.stripe_subscription_id:
        site.stripe_subscription_id = sub_id

    if not site.stripe_customer_id:
        site.stripe_customer_id = session_data.get("customer")

    db.commit()


def _handle_subscription_update(sub_data: dict, db: Session):
    """Handle subscription created/updated — sync status, plan, period."""
    customer_id = sub_data.get("customer")
    site = _find_site_by_customer(customer_id, db)
    if not site:
        site = _find_site_by_metadata(sub_data.get("metadata", {}), db)
    if not site:
        logger.warning("subscription event: no site for customer %s", customer_id)
        return

    site.stripe_subscription_id = sub_data.get("id")
    site.subscription_status = sub_data.get("status", "active")  # active, trialing, past_due, etc.

    # Extract plan info from the first line item
    items = sub_data.get("items", {}).get("data", [])
    if items:
        price = items[0].get("price", {})
        product_id = price.get("product")
        site.subscription_plan = PLAN_FROM_PRODUCT.get(product_id, site.subscription_plan)
        recurring = price.get("recurring", {})
        site.subscription_interval = recurring.get("interval", site.subscription_interval)

    # Period end
    period_end = sub_data.get("current_period_end")
    if period_end:
        site.subscription_current_period_end = datetime.fromtimestamp(period_end, tz=timezone.utc)

    # Trial end
    trial_end = sub_data.get("trial_end")
    if trial_end:
        site.trial_ends_at = datetime.fromtimestamp(trial_end, tz=timezone.utc)

    db.commit()


def _handle_subscription_deleted(sub_data: dict, db: Session):
    """Subscription cancelled — mark site as cancelled."""
    customer_id = sub_data.get("customer")
    site = _find_site_by_customer(customer_id, db)
    if not site:
        logger.warning("subscription.deleted: no site for customer %s", customer_id)
        return

    site.subscription_status = "cancelled"
    db.commit()


def _handle_payment_failed(invoice_data: dict, db: Session):
    """Invoice payment failed — mark subscription as past_due."""
    customer_id = invoice_data.get("customer")
    site = _find_site_by_customer(customer_id, db)
    if not site:
        return

    site.subscription_status = "past_due"
    db.commit()
