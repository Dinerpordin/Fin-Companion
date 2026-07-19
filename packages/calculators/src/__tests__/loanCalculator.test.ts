import { describe, it, expect } from "vitest";
import {
  calculateLoan,
  calculateMultiLoan,
  calculateCostBand,
  approximateAPR,
  instalmentsToMonths,
  getAmountBand,
} from "../loanCalculator";

describe("instalmentsToMonths", () => {
  it("converts monthly instalments correctly", () => {
    expect(instalmentsToMonths(24, "monthly")).toBe(24);
  });
  it("converts weekly instalments correctly", () => {
    expect(instalmentsToMonths(52, "weekly")).toBeCloseTo(12, 0);
  });
  it("converts quarterly instalments correctly", () => {
    expect(instalmentsToMonths(4, "quarterly")).toBe(12);
  });
});

describe("calculateCostBand", () => {
  it("returns low for APR <= 12%", () => {
    expect(calculateCostBand(10)).toBe("low");
    expect(calculateCostBand(12)).toBe("low");
  });
  it("returns medium for APR 12–24%", () => {
    expect(calculateCostBand(18)).toBe("medium");
    expect(calculateCostBand(24)).toBe("medium");
  });
  it("returns high for APR 24–48%", () => {
    expect(calculateCostBand(36)).toBe("high");
  });
  it("returns very_high for APR > 48%", () => {
    expect(calculateCostBand(60)).toBe("very_high");
  });
});

describe("calculateLoan", () => {
  it("calculates correct total repay for a simple monthly loan", () => {
    const result = calculateLoan({
      loan_amount: 50_000,
      instalment_amount: 2_500,
      frequency: "monthly",
      instalment_count: 24,
      upfront_fees: 1_000,
    });
    expect(result.total_repay).toBe(61_000); // 2500*24 + 1000
    expect(result.total_extra_paid).toBe(11_000); // 61000 - 50000
    expect(result.time_remaining_months).toBe(24);
    expect(result.cost_band).toBeDefined();
  });

  it("returns zero extra paid for an interest-free loan", () => {
    const result = calculateLoan({
      loan_amount: 10_000,
      instalment_amount: 1_000,
      frequency: "monthly",
      instalment_count: 10,
      upfront_fees: 0,
    });
    expect(result.total_repay).toBe(10_000);
    expect(result.total_extra_paid).toBe(0);
    expect(result.cost_band).toBe("low");
  });

  it("classifies high-cost informal loan correctly", () => {
    // Typical NGO flat-rate loan: 50,000 at 2,500/week for 26 weeks
    const result = calculateLoan({
      loan_amount: 50_000,
      instalment_amount: 2_500,
      frequency: "weekly",
      instalment_count: 26,
      upfront_fees: 2_500,
    });
    expect(result.total_extra_paid).toBeGreaterThan(0);
    expect(result.cost_band).toMatch(/high|very_high/);
  });

  it("applies upfront fees to total repay", () => {
    const result = calculateLoan({
      loan_amount: 20_000,
      instalment_amount: 2_000,
      frequency: "monthly",
      instalment_count: 12,
      upfront_fees: 500,
    });
    expect(result.total_repay).toBe(24_500);
  });
});

describe("calculateMultiLoan", () => {
  it("aggregates two loans correctly", () => {
    const result = calculateMultiLoan([
      {
        loan_amount: 30_000,
        instalment_amount: 1_500,
        frequency: "monthly",
        instalment_count: 24,
        upfront_fees: 0,
      },
      {
        loan_amount: 20_000,
        instalment_amount: 1_000,
        frequency: "monthly",
        instalment_count: 24,
        upfront_fees: 0,
      },
    ]);
    expect(result.loans).toHaveLength(2);
    expect(result.total_monthly_burden).toBe(2_500);
    expect(result.combined_total_repay).toBe(60_000);
    expect(result.combined_total_extra_paid).toBe(10_000);
  });

  it("throws for more than 5 loans", () => {
    const loan = {
      loan_amount: 10_000,
      instalment_amount: 1_000,
      frequency: "monthly" as const,
      instalment_count: 12,
      upfront_fees: 0,
    };
    expect(() => calculateMultiLoan(Array(6).fill(loan))).toThrow();
  });

  it("throws for empty input", () => {
    expect(() => calculateMultiLoan([])).toThrow();
  });
});

describe("getAmountBand", () => {
  it("classifies amounts into correct bands", () => {
    expect(getAmountBand(5_000)).toBe("under_10k");
    expect(getAmountBand(25_000)).toBe("10k_50k");
    expect(getAmountBand(100_000)).toBe("50k_200k");
    expect(getAmountBand(500_000)).toBe("200k_1m");
    expect(getAmountBand(2_000_000)).toBe("over_1m");
  });
});
