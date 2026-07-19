import type {
  CostBand,
  LoanCalculatorInput,
  LoanCalculatorOutput,
  LoanFrequency,
  MultiLoanOutput,
} from "@fc/shared";

// ─── Frequency helpers ────────────────────────────────────────────────────────

/** Returns the number of instalments per year for a given frequency */
export function instalmentsPerYear(frequency: LoanFrequency): number {
  const map: Record<LoanFrequency, number> = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  };
  return map[frequency];
}

/** Converts instalment count to equivalent months */
export function instalmentsToMonths(
  count: number,
  frequency: LoanFrequency
): number {
  return (count / instalmentsPerYear(frequency)) * 12;
}

// ─── Cost band ────────────────────────────────────────────────────────────────

/**
 * Classify the effective APR into a cost band.
 * Thresholds calibrated for Bangladesh informal/formal lending landscape.
 */
export function calculateCostBand(aprPercent: number): CostBand {
  if (aprPercent <= 12) return "low";
  if (aprPercent <= 24) return "medium";
  if (aprPercent <= 48) return "high";
  return "very_high";
}

// ─── APR approximation (Newton-Raphson IRR) ────────────────────────────────────

/**
 * Approximate the annual percentage rate from loan cash flows.
 * Uses Newton-Raphson on the IRR of the cash flow series.
 * Returns 0 if convergence fails (e.g. interest-free loan).
 *
 * PARITY NOTE — This algorithm is intentionally duplicated in Python at:
 *   apps/api/app/routers/calculator.py :: _approximate_apr()
 *
 * Rationale: raw loan inputs must NEVER leave the client (privacy policy), so
 * the calculation runs here. The Python copy serves the server-side endpoint
 * used by WhatsApp and enterprise partners.
 *
 * Guard alignment: both implementations use `max(r_new, 0.0001)` to prevent
 * divergence. If you change the threshold here, update calculator.py too.
 */
export function approximateAPR(
  principal: number,
  instalmentAmount: number,
  instalmentCount: number,
  frequency: LoanFrequency,
  upfrontFees: number
): number {
  // Net amount received by borrower
  const netPrincipal = principal - upfrontFees;
  if (netPrincipal <= 0 || instalmentAmount <= 0 || instalmentCount <= 0) {
    return 0;
  }

  const periodsPerYear = instalmentsPerYear(frequency);

  // NPV function for periodic rate r
  const npv = (r: number): number => {
    let pv = 0;
    for (let t = 1; t <= instalmentCount; t++) {
      pv += instalmentAmount / Math.pow(1 + r, t);
    }
    return pv - netPrincipal;
  };

  // Derivative of NPV
  const dnpv = (r: number): number => {
    let d = 0;
    for (let t = 1; t <= instalmentCount; t++) {
      d -= (t * instalmentAmount) / Math.pow(1 + r, t + 1);
    }
    return d;
  };

  // Newton-Raphson iteration
  let r = 0.02; // initial guess: 2% per period
  for (let i = 0; i < 100; i++) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(df) < 1e-10) break;
    const rNew = r - f / df;
    if (Math.abs(rNew - r) < 1e-8) {
      r = rNew;
      break;
    }
    // Guard against divergence: same threshold as calculator.py
    r = Math.max(rNew, 0.0001);
  }

  const annualRate = (Math.pow(1 + r, periodsPerYear) - 1) * 100;
  return Math.max(0, Math.round(annualRate * 100) / 100);
}

// ─── Core loan calculator ─────────────────────────────────────────────────────

/**
 * Calculate loan repayment totals from user inputs.
 * All logic is deterministic — no LLM, no network calls.
 *
 * Rules:
 * - Runs client-side in Phase 1
 * - Raw inputs are NEVER sent to the server
 * - Outputs are always in BDT amounts first
 */
export function calculateLoan(
  input: LoanCalculatorInput
): LoanCalculatorOutput {
  const {
    loan_amount,
    instalment_amount,
    instalment_count,
    frequency,
    upfront_fees,
  } = input;

  const total_repay =
    instalment_amount * instalment_count + (upfront_fees ?? 0);
  const total_extra_paid = total_repay - loan_amount;
  const time_remaining_months = Math.round(
    instalmentsToMonths(instalment_count, frequency)
  );

  const apr = approximateAPR(
    loan_amount,
    instalment_amount,
    instalment_count,
    frequency,
    upfront_fees ?? 0
  );

  return {
    total_repay: Math.round(total_repay),
    total_extra_paid: Math.round(total_extra_paid),
    time_remaining_months,
    cost_band: calculateCostBand(apr),
    approximate_apr_percent: apr,
  };
}

// ─── Multi-loan summary ────────────────────────────────────────────────────────

/**
 * Consolidate up to 5 loans into a combined summary.
 * Each loan is calculated independently then aggregated.
 */
export function calculateMultiLoan(
  inputs: LoanCalculatorInput[]
): MultiLoanOutput {
  if (inputs.length === 0) {
    throw new Error("At least one loan input is required");
  }
  if (inputs.length > 5) {
    throw new Error("Maximum 5 concurrent loans supported");
  }

  const loans = inputs.map((input) => ({
    input,
    output: calculateLoan(input),
  }));

  const periodsPerYear = (freq: LoanFrequency) => instalmentsPerYear(freq);

  // Monthly burden = sum of each loan's monthly equivalent payment
  const total_monthly_burden = inputs.reduce((sum, inp) => {
    const monthlyEquiv =
      (inp.instalment_amount * periodsPerYear(inp.frequency)) / 12;
    return sum + monthlyEquiv;
  }, 0);

  const combined_total_repay = loans.reduce(
    (sum, l) => sum + l.output.total_repay,
    0
  );
  const combined_total_extra_paid = loans.reduce(
    (sum, l) => sum + l.output.total_extra_paid,
    0
  );

  return {
    loans,
    total_monthly_burden: Math.round(total_monthly_burden),
    combined_total_repay: Math.round(combined_total_repay),
    combined_total_extra_paid: Math.round(combined_total_extra_paid),
  };
}

// ─── Amount band helper ────────────────────────────────────────────────────────

import type { AmountBand } from "@fc/shared";

export function getAmountBand(amount: number): AmountBand {
  if (amount < 10_000) return "under_10k";
  if (amount < 50_000) return "10k_50k";
  if (amount < 200_000) return "50k_200k";
  if (amount < 1_000_000) return "200k_1m";
  return "over_1m";
}
