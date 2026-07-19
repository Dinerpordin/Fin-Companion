import { describe, it, expect } from "vitest";
import { scenarioPayMore, scenarioDpsProjection } from "../scenarioPlanner";
import type { LoanCalculatorInput } from "@fc/shared";

// --- Shared fixture -----------------------------------------------------------

/** A typical monthly BDT microfinance loan */
const BASE_LOAN: LoanCalculatorInput = {
  loan_amount: 100_000,
  instalment_amount: 5_000,
  frequency: "monthly",
  instalment_count: 24,
  upfront_fees: 500,
};

// --- scenarioPayMore ----------------------------------------------------------

describe("scenarioPayMore", () => {
  it("saves months and interest when paying extra", () => {
    const result = scenarioPayMore({
      original: BASE_LOAN,
      extra_per_period: 1_000,
    });

    expect(result.months_saved).toBeGreaterThan(0);
    expect(result.interest_saved_bdt).toBeGreaterThanOrEqual(0);
    expect(result.new_time_months).toBeLessThan(24);
    expect(result.new_total_repay).toBeGreaterThan(0);
  });

  it("returns no savings when extra_per_period is 0", () => {
    const result = scenarioPayMore({
      original: BASE_LOAN,
      extra_per_period: 0,
    });

    // With zero extra the instalment does not change so months_saved should be 0
    expect(result.months_saved).toBe(0);
    expect(result.interest_saved_bdt).toBe(0);
  });

  it("includes correct Bangla and English labels", () => {
    const result = scenarioPayMore({
      original: BASE_LOAN,
      extra_per_period: 500,
    });

    expect(result.label_en).toContain("500");
    expect(result.label_bn).toContain("500");
    expect(result.label_en).toContain("extra per instalment");
  });

  it("reduces time for a weekly loan with extra payment", () => {
    const weeklyLoan: LoanCalculatorInput = {
      ...BASE_LOAN,
      frequency: "weekly",
      instalment_count: 52,
      instalment_amount: 2_000,
    };

    const result = scenarioPayMore({
      original: weeklyLoan,
      extra_per_period: 500,
    });

    expect(result.months_saved).toBeGreaterThan(0);
  });

  it("upfront fees are reflected in new_total_repay", () => {
    const result = scenarioPayMore({
      original: BASE_LOAN,
      extra_per_period: 1_000,
    });

    // new_total_repay must include upfront_fees (500)
    expect(result.new_total_repay).toBeGreaterThan(500);
  });
});

// --- scenarioDpsProjection ----------------------------------------------------

describe("scenarioDpsProjection", () => {
  it("maturity value exceeds total deposited when rate > 0", () => {
    const result = scenarioDpsProjection({
      monthly_deposit: 5_000,
      tenor_months: 36,
      annual_rate_percent: 7,
    });

    expect(result.estimated_maturity_value).toBeGreaterThan(result.total_deposited);
    expect(result.estimated_interest_earned).toBeGreaterThan(0);
  });

  it("maturity value equals total deposited when rate is 0", () => {
    const result = scenarioDpsProjection({
      monthly_deposit: 5_000,
      tenor_months: 24,
      annual_rate_percent: 0,
    });

    expect(result.estimated_maturity_value).toBe(result.total_deposited);
    expect(result.estimated_interest_earned).toBe(0);
  });

  it("total_deposited equals monthly_deposit x tenor_months", () => {
    const result = scenarioDpsProjection({
      monthly_deposit: 3_000,
      tenor_months: 12,
      annual_rate_percent: 6,
    });

    expect(result.total_deposited).toBe(36_000);
  });

  it("returns rounded integer values", () => {
    const result = scenarioDpsProjection({
      monthly_deposit: 1_234,
      tenor_months: 13,
      annual_rate_percent: 7.5,
    });

    expect(Number.isInteger(result.total_deposited)).toBe(true);
    expect(Number.isInteger(result.estimated_maturity_value)).toBe(true);
    expect(Number.isInteger(result.estimated_interest_earned)).toBe(true);
  });

  it("longer tenors yield more interest at the same rate", () => {
    const short = scenarioDpsProjection({
      monthly_deposit: 5_000,
      tenor_months: 12,
      annual_rate_percent: 7,
    });
    const long = scenarioDpsProjection({
      monthly_deposit: 5_000,
      tenor_months: 36,
      annual_rate_percent: 7,
    });

    expect(long.estimated_interest_earned).toBeGreaterThan(short.estimated_interest_earned);
  });
});
