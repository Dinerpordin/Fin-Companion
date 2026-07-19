/**
 * POST /api/loan/calculate
 *
 * TypeScript port of apps/api/app/routers/calculator.py
 *
 * Deterministic loan cost calculator. All math is done here — no LLM involved.
 * Privacy: raw inputs are NOT logged or persisted.
 *
 * NOTE: The APR calculation (approximateAPR) matches the implementation in
 * packages/calculators/src/loanCalculator.ts and the original Python
 * _approximate_apr() in calculator.py. All three must stay in sync.
 */
import { NextRequest, NextResponse } from "next/server";

type Frequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";

interface LoanCalculateRequest {
  loan_amount: number;
  instalment_amount: number;
  frequency: Frequency;
  instalment_count: number;
  upfront_fees?: number;
}

function instalmentPerYear(freq: Frequency): number {
  const map: Record<Frequency, number> = {
    weekly: 52, biweekly: 26, monthly: 12, quarterly: 4, yearly: 1,
  };
  return map[freq];
}

function costBand(apr: number): string {
  if (apr <= 12) return "low";
  if (apr <= 24) return "medium";
  if (apr <= 48) return "high";
  return "very_high";
}

/**
 * Approximate APR via Newton-Raphson IRR.
 * Guard: r = max(r_new, 0.0001) prevents divergence — same threshold as Python.
 */
function approximateAPR(
  principal: number,
  instalment: number,
  count: number,
  freq: Frequency,
  fees: number
): number {
  const net = principal - fees;
  if (net <= 0 || instalment <= 0) return 0;
  const periodsPerYear = instalmentPerYear(freq);

  const npv = (r: number) =>
    Array.from({ length: count }, (_, i) => instalment / Math.pow(1 + r, i + 1))
      .reduce((s, v) => s + v, 0) - net;

  const dnpv = (r: number) =>
    Array.from({ length: count }, (_, i) => (-(i + 1) * instalment) / Math.pow(1 + r, i + 2))
      .reduce((s, v) => s + v, 0);

  let r = 0.02;
  for (let i = 0; i < 100; i++) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(df) < 1e-10) break;
    const rNew = r - f / df;
    if (Math.abs(rNew - r) < 1e-8) { r = rNew; break; }
    r = Math.max(rNew, 0.0001);
  }

  const annual = (Math.pow(1 + r, periodsPerYear) - 1) * 100;
  return Math.round(Math.max(0, annual) * 100) / 100;
}

export async function POST(req: NextRequest) {
  let body: LoanCalculateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { loan_amount, instalment_amount, frequency, instalment_count, upfront_fees = 0 } = body;

  if (!loan_amount || loan_amount <= 0) return NextResponse.json({ error: "loan_amount must be > 0" }, { status: 422 });
  if (!instalment_amount || instalment_amount <= 0) return NextResponse.json({ error: "instalment_amount must be > 0" }, { status: 422 });
  if (!instalment_count || instalment_count <= 0) return NextResponse.json({ error: "instalment_count must be > 0" }, { status: 422 });
  if (!["weekly","biweekly","monthly","quarterly","yearly"].includes(frequency)) {
    return NextResponse.json({ error: "Invalid frequency" }, { status: 422 });
  }

  const totalRepay = Math.round(instalment_amount * instalment_count + upfront_fees);
  const totalExtraPaid = Math.round(totalRepay - loan_amount);
  const timeRemainingMonths = Math.round((instalment_count / instalmentPerYear(frequency)) * 12);
  const apr = approximateAPR(loan_amount, instalment_amount, instalment_count, frequency, upfront_fees);

  return NextResponse.json({
    total_repay: totalRepay,
    total_extra_paid: totalExtraPaid,
    time_remaining_months: timeRemainingMonths,
    cost_band: costBand(apr),
    approximate_apr_percent: apr,
    privacy_note: "এই হিসাব শুধু তথ্যের জন্য। আপনার তথ্য সার্ভারে সংরক্ষণ করা হয়নি।",
  });
}
