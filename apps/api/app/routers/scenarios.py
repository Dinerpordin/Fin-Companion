from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime

from app.core.database import get_db
from app.core.models import SavedScenario, User

logger = logging.getLogger(__name__)
router = APIRouter()


class ScenarioCreate(BaseModel):
    user_id: uuid.UUID
    scenario_type: str
    input_data: Dict[str, Any]
    results: Dict[str, Any]


class ScenarioResponse(ScenarioCreate):
    id: uuid.UUID
    created_at: datetime


@router.get("/scenarios", response_model=List[ScenarioResponse])
async def get_scenarios(
    user_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=200, description="Max scenarios per page"),
    offset: int = Query(0, ge=0, description="Number of scenarios to skip"),
    db: AsyncSession = Depends(get_db)
):
    """Fetch paginated saved scenarios for a specific user."""
    # NOTE (MVP): user_id is trusted from the client. Add JWT middleware before production.
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    result = await db.execute(
        select(SavedScenario)
        .where(SavedScenario.user_id == user_id)
        .order_by(SavedScenario.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    scenarios = result.scalars().all()
    return scenarios


@router.post("/scenarios", response_model=ScenarioResponse, status_code=201)
async def save_scenario(scenario: ScenarioCreate, db: AsyncSession = Depends(get_db)):
    """Save a new scenario for the user."""
    # Ensure user exists
    result = await db.execute(select(User).where(User.id == scenario.user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_scenario = SavedScenario(
        user_id=scenario.user_id,
        scenario_type=scenario.scenario_type,
        input_data=scenario.input_data,
        results=scenario.results
    )
    
    db.add(db_scenario)
    await db.commit()
    await db.refresh(db_scenario)
    
    return db_scenario


@router.delete("/scenarios/{scenario_id}", status_code=204)
async def delete_scenario(scenario_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Delete a saved scenario for the user."""
    result = await db.execute(
        select(SavedScenario).where(SavedScenario.id == scenario_id, SavedScenario.user_id == user_id)
    )
    scenario = result.scalars().first()
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    await db.delete(scenario)
    await db.commit()
    return None
