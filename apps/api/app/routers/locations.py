"""Locations search router."""

import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional
from app.core.database import get_db
from app.core.models import Location, Institution

router = APIRouter()

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance


@router.get("/locations/search")
async def search_locations(
    district: Optional[str] = Query(None),
    upazila: Optional[str] = Query(None),
    lat: Optional[float] = Query(None, ge=-90, le=90),
    lng: Optional[float] = Query(None, ge=-180, le=180),
    category: Optional[str] = Query(None),
    institution_type: Optional[str] = Query(None, description="bank|mfi|agent_banking"),
    limit: int = Query(10, le=30),
    db: AsyncSession = Depends(get_db),
):
    """
    Find nearest branches, agent banking outlets, and MFIs.
    Filters for district, upazila, category, and institution_type are pushed
    into SQL to avoid full table scans.
    """
    query = select(Location).join(Institution).options(joinedload(Location.institution))

    if district:
        query = query.where(Location.district == district)
    if upazila:
        query = query.where(Location.upazila == upazila)

    # Push category filter into SQL using PostgreSQL JSONB @> (contains) operator.
    # This replaces the previous Python-side loop and benefits from a GIN index
    # on products_supported if one is created.
    if category:
        query = query.where(Location.products_supported.contains([category]))

    # Push institution_type filter into SQL via the joined Institution table.
    if institution_type:
        query = query.where(Institution.institution_type == institution_type)

    # Apply limit at DB level; distance re-sort below may change final ordering.
    result = await db.execute(query.limit(limit * 3))  # fetch 3× limit to allow distance re-sort
    locations = result.scalars().all()

    # Calculate distance if lat/lng provided
    data = []
    for loc in locations:
        dist = None
        if lat is not None and lng is not None and loc.latitude is not None and loc.longitude is not None:
            dist = haversine(lat, lng, loc.latitude, loc.longitude)

        data.append({
            "id": str(loc.id),
            "institution_name_en": loc.institution.name_en,
            "institution_name_bn": loc.institution.name_bn,
            "location_type": loc.location_type,
            "branch_name": loc.branch_name,
            "address_text": loc.address_text,
            "district": loc.district,
            "upazila": loc.upazila,
            "phone_public": loc.phone_public,
            "products_supported": loc.products_supported,
            "distance_km": dist,
            "verified_at": loc.verified_at.isoformat()
        })

    if lat is not None and lng is not None:
        # Sort by distance
        data.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else float('inf'))
    else:
        # Sort by verified date descending if no distance
        data.sort(key=lambda x: x["verified_at"], reverse=True)

    return {
        "success": True,
        "data": data[:limit],
        "meta": {"total": len(data)},
    }
