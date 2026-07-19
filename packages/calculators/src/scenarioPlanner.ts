import type { LoanCalculatorInput } from "@fc/shared";
import { instalmentsPerYear } from "./loanCalculator";

// ─── Scenario: Pay more per instalment ───────────────────────────────────────

export interface PayMoreScenarioInput {
  original: LoanCalculatorInput;
  extra_per_period: number; // additional BDT per instalment
}

export interface ScenarioOutput {
  label_bn: string;
  label_en: string;
  months_saved: number;
  interest_saved_bdt: number;
  new_total_repay: number;
  new_time_months: number;
}

/**
 * Calculate savings from paying an extra amount each instalment.
 * Uses simple amortisation simulation — deterministic, no LLM.
 */
export function scenarioPayMore(input: PayMoreScenarioInput): ScenarioOutput {
  const { original, extra_per_period } = input;
  const newInstalment = original.instalment_amount + extra_per_period;

  // Estimate new count (instalment_amount scales linearly vs principal)
  const ratio = original.instalment_amount / newInstalment;
  const newCount = Math.ceil(original.instalment_count * ratio);

  const originalTotal =
    original.instalment_amount * original.instalment_count +
    (original.upfront_fees ?? 0);
  const newTotal =
    newInstalment * newCount + (original.upfront_fees ?? 0);

  const interest_saved_bdt = Math.max(0, Math.round(originalTotal - newTotal));
  const original_months = Math.round(
    (original.instalment_count / instalmentsPerYear(original.frequency)) * 12
  );
  const new_months = Math.round(
    (newCount / instalmentsPerYear(original.frequency)) * 12
  );
  const months_saved = Math.max(0, original_months - new_months);

  return {
    label_bn: `প্রতি কিস্তিতে ৳${extra_per_period} বেশি দিলে`,
    label_en: `Paying ৳${extra_per_period} extra per instalment`,
    months_saved,
    interest_saved_bdt,
    new_total_repay: Math.round(newTotal),
    new_time_months: new_months,
  };
}

// ─── Scenario: DPS maturity projection ───────────────────────────────────────

export interface DpsScenarioInput {
  monthly_deposit: number; // BDT per month
  tenor_months: number;
  annual_rate_percent: number; // nominal annual interest rate
}

export interface DpsScenarioOutput {
  total_deposited: number;
  estimated_maturity_value: number;
  estimated_interest_earned: number;
}

/**
 * Project DPS maturity value using compound interest.
 * Formula: FV of annuity = P * ((1+r)^n - 1) / r
 * where r = monthly rate, n = months
 */
export function scenarioDpsProjection(
  input: DpsScenarioInput
): DpsScenarioOutput {
  const { monthly_deposit, tenor_months, annual_rate_percent } = input;
  const r = annual_rate_percent / 100 / 12;
  const n = tenor_months;

  let maturity_value: number;
  if (r === 0) {
    maturity_value = monthly_deposit * n;
  } else {
    maturity_value = monthly_deposit * ((Math.pow(1 + r, n) - 1) / r);
  }

  const total_deposited = monthly_deposit * n;
  const estimated_interest_earned = maturity_value - total_deposited;

  return {
    total_deposited: Math.round(total_deposited),
    estimated_maturity_value: Math.round(maturity_value),
    estimated_interest_earned: Math.round(estimated_interest_earned),
  };
}
