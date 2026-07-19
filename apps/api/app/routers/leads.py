"""Lead generation router for capturing user interest in financial products."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
import uuid

from app.core.database import get_db
from app.core.models import Lead, Product, User

router = APIRouter()

class LeadSubmitRequest(BaseModel):
    product_id: str
    contact_phone: str
    user_id: Optional[str] = None

@router.post("/leads")
async def submit_lead(
    request: LeadSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit a lead for a specific financial product.
    Returns success message or 404 if product not found.
    """
    # Verify product exists
    try:
        product_uuid = uuid.UUID(request.product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product_id format")

    product_query = await db.execute(select(Product).where(Product.id == product_uuid))
    product = product_query.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user_uuid = None
    if request.user_id:
        try:
            user_uuid = uuid.UUID(request.user_id)
            user_query = await db.execute(select(User).where(User.id == user_uuid))
            if not user_query.scalar_one_or_none():
                user_uuid = None # user not found in our DB, ignore
        except ValueError:
            pass

    new_lead = Lead(
        user_id=user_uuid,
        product_id=product_uuid,
        contact_phone=request.contact_phone,
        status="pending"
    )
    
    db.add(new_lead)
    await db.commit()
    await db.refresh(new_lead)
    
    return {
        "success": True,
        "data": {
            "lead_id": str(new_lead.id),
            "status": new_lead.status,
            "created_at": new_lead.created_at.isoformat()
        },
        "message": "Lead submitted successfully"
    }
