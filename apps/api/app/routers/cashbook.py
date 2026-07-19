from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.core.database import get_db
from app.core.models import CashbookEntry, User

logger = logging.getLogger(__name__)
router = APIRouter()


class CashbookEntryCreate(BaseModel):
    user_id: uuid.UUID
    amount: float = Field(..., gt=0)
    entry_type: str = Field(..., pattern="^(income|expense)$")
    category: str
    date: datetime
    note: Optional[str] = None


class CashbookEntryResponse(CashbookEntryCreate):
    id: uuid.UUID
    created_at: datetime


@router.get("/cashbook/entries", response_model=List[CashbookEntryResponse])
async def get_entries(
    user_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=200, description="Max entries per page"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
    db: AsyncSession = Depends(get_db)
):
    """Fetch paginated cashbook entries for a specific user."""
    # NOTE (MVP): user_id is trusted from the client. Add JWT middleware before production.
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(CashbookEntry)
        .where(CashbookEntry.user_id == user_id)
        .order_by(CashbookEntry.date.desc())
        .limit(limit)
        .offset(offset)
    )
    entries = result.scalars().all()
    return entries


@router.post("/cashbook/entries", response_model=CashbookEntryResponse, status_code=201)
async def create_entry(entry: CashbookEntryCreate, db: AsyncSession = Depends(get_db)):
    """Create a new cashbook entry for the user."""
    # Ensure user exists
    result = await db.execute(select(User).where(User.id == entry.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_entry = CashbookEntry(
        user_id=entry.user_id,
        amount=entry.amount,
        entry_type=entry.entry_type,
        category=entry.category,
        date=entry.date,
        note=entry.note
    )
    
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    
    return db_entry


@router.delete("/cashbook/entries/{entry_id}", status_code=204)
async def delete_entry(entry_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Delete a cashbook entry for the user."""
    result = await db.execute(
        select(CashbookEntry).where(CashbookEntry.id == entry_id, CashbookEntry.user_id == user_id)
    )
    entry = result.scalars().first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    await db.delete(entry)
    await db.commit()
    return None
