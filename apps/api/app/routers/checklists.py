"""Document checklists router."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional
from app.core.database import get_db
from app.core.models import DocumentChecklist

router = APIRouter()


@router.get("/checklists")
async def get_checklist(
    institution_id: Optional[str] = Query(None),
    product_category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """
    Return document checklist for a product category at a given institution.
    """
    query = select(DocumentChecklist).options(joinedload(DocumentChecklist.institution))
    
    if institution_id:
        query = query.where(DocumentChecklist.institution_id == institution_id)
    if product_category:
        query = query.where(DocumentChecklist.product_category == product_category)
        
    result = await db.execute(query)
    checklists = result.scalars().all()
    
    data = []
    for c in checklists:
        data.append({
            "id": str(c.id),
            "institution_name_bn": c.institution.name_bn if c.institution else "সাধারণ",
            "product_category": c.product_category,
            "checklist_bn": c.checklist_bn,
            "verified_at": c.verified_at.isoformat()
        })
        
    return {
        "success": True,
        "data": data,
    }
