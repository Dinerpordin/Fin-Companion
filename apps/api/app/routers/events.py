"""
Privacy-safe analytics events router.
Only accepts pre-binned data — no raw financial values allowed.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, model_validator, ConfigDict
from typing import Optional, Literal, Any
import logging
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.models import AnalyticsEventBinned

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_TOOLS = {
    "loan_checker", "product_compare", "health_assessment",
    "cashbook", "companion", "locator", "checklists", "scenario_planner",
}

ALLOWED_INTENTS = {
    "loan_assessment", "loan_simulation", "product_comparison",
    "nearest_provider", "how_to_apply", "health_snapshot",
    "accounting_help", "financial_education", "out_of_scope",
}

ALLOWED_AMOUNT_BANDS = {"under_10k", "10k_50k", "50k_200k", "200k_1m", "over_1m"}
ALLOWED_COST_BANDS = {"low", "medium", "high", "very_high"}

FORBIDDEN_RAW_KEYS = {"amount", "income", "expense", "loan_amount", "salary", "raw_value"}


class BinnedEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_id_rotating: str = Field(..., min_length=1, max_length=128)
    tool_name: str
    intent_class: Optional[str] = None
    amount_band: Optional[str] = None
    purpose_band: Optional[str] = None
    lender_type: Optional[str] = None
    cost_band: Optional[str] = None
    region_type: Optional[Literal["rural", "semi_urban", "urban", "unknown"]] = None
    event_month: str = Field(..., pattern=r"^\d{4}-\d{2}$")

    @model_validator(mode="before")
    @classmethod
    def check_for_raw_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            for key in data.keys():
                key_lower = key.lower()
                # Skip check for allowed binned fields containing 'band'
                if "band" in key_lower:
                    continue
                if any(forbidden in key_lower for forbidden in FORBIDDEN_RAW_KEYS):
                    logger.warning(f"Privacy alert: Blocked analytics event containing raw financial key '{key}'.")
                    raise ValueError(f"Raw financial data is not permitted. Found forbidden key: {key}")
        return data

    @model_validator(mode="after")
    def validate_bands_and_tools(self):
        """Ensure valid bands and tools."""
        if self.amount_band and self.amount_band not in ALLOWED_AMOUNT_BANDS:
            raise ValueError(f"Invalid amount_band: {self.amount_band}. Must be a band, not a raw value.")
        if self.cost_band and self.cost_band not in ALLOWED_COST_BANDS:
            raise ValueError(f"Invalid cost_band: {self.cost_band}")
        if self.tool_name not in ALLOWED_TOOLS:
            raise ValueError(f"Unknown tool: {self.tool_name}")
        if self.intent_class and self.intent_class not in ALLOWED_INTENTS:
            raise ValueError(f"Unknown intent: {self.intent_class}")
        return self


@router.post("/events/binned", status_code=202)
async def record_event(event: BinnedEvent, db: AsyncSession = Depends(get_db)):
    """
    Accept privacy-safe binned analytics events only.
    Raw financial values are rejected at the Pydantic validation layer.
    """
    db_event = AnalyticsEventBinned(
        session_id_rotating=event.session_id_rotating,
        tool_name=event.tool_name,
        intent_class=event.intent_class,
        amount_band=event.amount_band,
        purpose_band=event.purpose_band,
        lender_type=event.lender_type,
        cost_band=event.cost_band,
        region_type=event.region_type,
        event_month=event.event_month
    )
    
    db.add(db_event)
    await db.commit()
    
    return {"accepted": True}
