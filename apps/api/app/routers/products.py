"""Products comparison router."""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload, joinedload
from typing import Optional
from app.core.database import get_db
from app.core.models import Product, Institution, ProductRate

router = APIRouter()


@router.get("/products/compare")
async def compare_products(
    category: Optional[str] = Query(None, description="fd|dps|savings|personal_loan|credit_card"),
    amount: Optional[float] = Query(None, gt=0),
    tenor_months: Optional[int] = Query(None, gt=0),
    district: Optional[str] = Query(None),
    islamic_only: bool = Query(False),
    sort_by: str = Query("rate", description="rate|cost|verified_date"),
    limit: int = Query(20, le=50),
    db: AsyncSession = Depends(get_db),
):
    """
    Compare financial products with source metadata and freshness indicators.
    Returns only active, verified records.
    """
    query = select(Product).join(Institution).options(
        joinedload(Product.institution),
        selectinload(Product.rates)
    )

    query = query.where(Product.status == "active")

    if category:
        query = query.where(Product.category == category)
    if amount is not None:
        query = query.where(
            or_(Product.min_amount == None, Product.min_amount <= amount)
        ).where(
            or_(Product.max_amount == None, Product.max_amount >= amount)
        )
    if tenor_months is not None:
        query = query.where(
            or_(Product.min_tenor_months == None, Product.min_tenor_months <= tenor_months)
        ).where(
            or_(Product.max_tenor_months == None, Product.max_tenor_months >= tenor_months)
        )
    if islamic_only:
        query = query.where(Product.islamic_flag == True)
        
    result = await db.execute(query)
    products = result.unique().scalars().all()
    
    data = []
    for p in products:
        if not p.rates:
            continue
            
        best_rate = max(p.rates, key=lambda r: r.nominal_rate)
        
        data.append({
            "id": str(p.id),
            "institution_name_en": p.institution.name_en,
            "institution_name_bn": p.institution.name_bn,
            "product_name_en": p.name_en,
            "product_name_bn": p.name_bn,
            "category": p.category,
            "islamic_flag": p.islamic_flag,
            "nominal_rate": best_rate.nominal_rate,
            "rate_type": best_rate.rate_type,
            "effective_notes": best_rate.effective_notes,
            "verified_at": best_rate.verified_at.isoformat(),
            "official_url": p.official_url,
            "is_featured": p.is_featured,
        })
        
    if sort_by == "rate":
        # high rate is good for FD/DPS, low rate is good for loans
        if category in ["personal_loan", "credit_card"]:
            data.sort(key=lambda x: (not x["is_featured"], x["nominal_rate"]))
        else:
            data.sort(key=lambda x: (x["is_featured"], x["nominal_rate"]), reverse=True)
    elif sort_by == "verified_date":
        data.sort(key=lambda x: (x["is_featured"], x["verified_at"]), reverse=True)

    return {
        "success": True,
        "data": data[:limit],
        "meta": {
            "total": len(data),
            "filters": {
                "category": category,
                "amount": amount,
                "tenor_months": tenor_months,
                "islamic_only": islamic_only,
            },
        }
    }


@router.get("/products/{product_id}")
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Full product detail with source and verification information."""
    try:
        import uuid
        prod_uuid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    query = select(Product).where(
        Product.id == prod_uuid,
        Product.status == "active"
    ).options(
        joinedload(Product.institution),
        selectinload(Product.rates),
        selectinload(Product.fees)
    )
    result = await db.execute(query)
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return {
        "success": True,
        "data": {
            "id": str(product.id),
            "institution_id": str(product.institution_id),
            "institution_name_en": product.institution.name_en,
            "institution_name_bn": product.institution.name_bn,
            "category": product.category,
            "name_en": product.name_en,
            "name_bn": product.name_bn,
            "description_short_bn": product.description_short_bn,
            "min_amount": product.min_amount,
            "max_amount": product.max_amount,
            "min_tenor_months": product.min_tenor_months,
            "max_tenor_months": product.max_tenor_months,
            "islamic_flag": product.islamic_flag,
            "official_url": product.official_url,
            "status": product.status,
            "is_featured": product.is_featured,
            "rates": [
                {
                    "id": str(r.id),
                    "rate_type": r.rate_type,
                    "nominal_rate": r.nominal_rate,
                    "effective_notes": r.effective_notes,
                    "verified_at": r.verified_at.isoformat(),
                    "confidence_flag": r.confidence_flag,
                } for r in product.rates
            ],
            "fees": [
                {
                    "id": str(f.id),
                    "fee_name": f.fee_name,
                    "fee_amount": f.fee_amount,
                    "fee_type": f.fee_type,
                    "notes": f.notes,
                    "verified_at": f.verified_at.isoformat(),
                } for f in product.fees
            ]
        }
    }

