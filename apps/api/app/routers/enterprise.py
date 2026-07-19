"""Enterprise Connectors Router for B2B Partners."""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
import secrets
import uuid

from app.core.database import get_db
from app.core.models import User, Lead, Product
from app.core.config import settings

router = APIRouter()

class ApiKeyResponse(BaseModel):
    api_key: str

@router.post("/enterprise/generate-key")
async def generate_api_key(
    user_id: str,
    authorization: str = Header(..., description="Bearer <ENTERPRISE_ADMIN_SECRET>"),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a new API key for a user.

    Requires the ENTERPRISE_ADMIN_SECRET to be set in the environment and
    passed as a Bearer token in the Authorization header.

    # TODO: Replace this admin-secret gate with Supabase JWT validation
    # once the enterprise partner auth flow is implemented.
    """
    # Guard: if the admin secret is not configured, disable this endpoint entirely.
    if not settings.ENTERPRISE_ADMIN_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Enterprise key generation is disabled (ENTERPRISE_ADMIN_SECRET not configured)."
        )

    # Validate the admin secret from the Authorization header.
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != settings.ENTERPRISE_ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Invalid or missing admin secret.")

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    user_query = await db.execute(select(User).where(User.id == user_uuid))
    user = user_query.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate a secure 32-character hex key
    new_key = secrets.token_hex(16)
    user.api_key = new_key

    await db.commit()

    return {"success": True, "api_key": new_key}


@router.get("/enterprise/leads")
async def get_enterprise_leads(
    x_api_key: str = Header(..., description="White-label Enterprise API Key"),
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve leads belonging to the authenticated partner (tenant-scoped).

    Leads are filtered to those where Lead.user_id matches the authenticated
    partner's user ID, preventing cross-partner data leakage.

    # TODO: Once Institution ownership is modelled (User → Institution FK),
    # replace this with a join-based filter:
    #   Lead.product.institution.owner_user_id == user.id
    """
    user_query = await db.execute(select(User).where(User.api_key == x_api_key))
    user = user_query.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    # Scope to leads that belong to this partner's user_id only.
    leads_query = await db.execute(
        select(Lead)
        .where(Lead.user_id == user.id)
        .options(selectinload(Lead.product))
        .order_by(Lead.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    leads = leads_query.scalars().all()

    data = []
    for lead in leads:
        data.append({
            "id": str(lead.id),
            "product_id": str(lead.product_id),
            "product_name": lead.product.name_en if lead.product else None,
            "contact_phone": lead.contact_phone,
            "status": lead.status,
            "created_at": lead.created_at.isoformat()
        })

    return {
        "success": True,
        "data": data,
        "meta": {
            "partner_name": user.name,
            "total_leads": len(data)
        }
    }
