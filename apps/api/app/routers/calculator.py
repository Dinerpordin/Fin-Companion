"""
Loan calculator router.
All calculations are deterministic — no LLM involved.
Raw financial inputs are NOT logged or stored.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


router = APIRouter()


class Frequency(str, Enum):
    weekly = "weekly"
    biweekly = "biweekly"
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"


class LoanCalculateRequest(BaseModel):
    loan_amount: float = Field(..., gt=0, description="Principal loan amount in BDT")
    instalment_amount: float = Field(..., gt=0, description="Amount per instalment in BDT")
    frequency: Frequency
    instalment_count: int = Field(..., gt=0, le=600)
    upfront_fees: float = Field(default=0.0, ge=0)


class LoanCalculateResponse(BaseModel):
    total_repay: int
    total_extra_paid: int
    time_remaining_months: int
    cost_band: str
    approximate_apr_percent: Optional[float] = None
    # Privacy note shown in response
    privacy_note: str = "এই হিসাব শুধু তথ্যের জন্য। আপনার তথ্য সার্ভারে সংরক্ষণ করা হয়নি।"


def _instalments_per_year(freq: Frequency) -> float:
    return {"weekly": 52, "biweekly": 26, "monthly": 12, "quarterly": 4, "yearly": 1}[freq]


def _calculate_cost_band(apr: float) -> str:
    if apr <= 12:
        return "low"
    if apr <= 24:
        return "medium"
    if apr <= 48:
        return "high"
    return "very_high"


def _approximate_apr(principal: float, instalment: float, count: int, freq: Frequency, fees: float) -> float:
    """
    Approximate APR via Newton-Raphson IRR.

    PARITY NOTE — This algorithm is intentionally duplicated in TypeScript at:
      packages/calculators/src/loanCalculator.ts :: approximateAPR()

    Rationale: raw loan inputs must NEVER leave the client (privacy policy), so
    the calculation runs client-side in TS. The Python version exists for the
    server-side `/loan/calculate` endpoint used by WhatsApp and enterprise partners
    where inputs are already anonymised at the channel layer.

    Guard alignment: both implementations use `max(r_new, 0.0001)` to prevent
    divergence. If you change the threshold here, update loanCalculator.ts too.
    """
    net = principal - fees
    if net <= 0 or instalment <= 0:
        return 0.0
    periods_per_year = _instalments_per_year(freq)

    def npv(r):
        return sum(instalment / (1 + r) ** t for t in range(1, count + 1)) - net

    def dnpv(r):
        return sum(-t * instalment / (1 + r) ** (t + 1) for t in range(1, count + 1))

    r = 0.02
    for _ in range(100):
        f, df = npv(r), dnpv(r)
        if abs(df) < 1e-10:
            break
        r_new = r - f / df
        if abs(r_new - r) < 1e-8:
            r = r_new
            break
        # Guard against divergence: same threshold as loanCalculator.ts
        r = max(r_new, 0.0001)

    annual = (pow(1 + r, periods_per_year) - 1) * 100
    return round(max(0.0, annual), 2)


@router.post("/loan/calculate", response_model=LoanCalculateResponse)
async def calculate_loan(req: LoanCalculateRequest):
    """
    Deterministic loan cost calculation.
    Privacy: raw inputs are not logged or persisted.
    """
    total_repay = req.instalment_amount * req.instalment_count + req.upfront_fees
    total_extra_paid = total_repay - req.loan_amount
    months = round((req.instalment_count / _instalments_per_year(req.frequency)) * 12)
    apr = _approximate_apr(
        req.loan_amount, req.instalment_amount, req.instalment_count, req.frequency, req.upfront_fees
    )

    return LoanCalculateResponse(
        total_repay=round(total_repay),
        total_extra_paid=round(total_extra_paid),
        time_remaining_months=months,
        cost_band=_calculate_cost_band(apr),
        approximate_apr_percent=apr,
    )
