/**
 * client-side analytics helper
 * Pre-bins data to comply with privacy rules and prevent sending raw financial inputs.
 */

import { getAmountBand } from "@fc/calculators";

const ROTATION_PERIOD_MS = 2 * 60 * 60 * 1000; // 2 hours

function getRotatingSessionId(): string {
  if (typeof localStorage === "undefined") {
    return "server-session";
  }

  const now = Date.now();
  let sessionId = localStorage.getItem("rotating_session_id");
  let createdAt = localStorage.getItem("rotating_session_created_at");

  if (!sessionId || !createdAt || now - parseInt(createdAt, 10) > ROTATION_PERIOD_MS) {
    sessionId = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("rotating_session_id", sessionId);
    localStorage.setItem("rotating_session_created_at", now.toString());
  }

  return sessionId;
}

// Re-export getAmountBand from @fc/calculators for convenience.
// Do NOT duplicate this logic here — use getAmountBand as the single source of truth.
const binAmount = (amount: number | undefined): string | null => {
  if (amount === undefined || amount === null || isNaN(amount)) return null;
  return getAmountBand(amount);
};
export { binAmount };

export function binCostRate(rate: number | undefined): string | null {
  if (rate === undefined || rate === null || isNaN(rate)) return null;
  if (rate < 7.0) return "low";
  if (rate <= 10.0) return "medium";
  if (rate <= 14.0) return "high";
  return "very_high";
}

export type TrackEventData = {
  intentClass?: "loan_assessment" | "loan_simulation" | "product_comparison" | "nearest_provider" | "how_to_apply" | "health_snapshot" | "accounting_help" | "financial_education" | "out_of_scope";
  amount?: number;
  purposeBand?: string;
  lenderType?: string;
  costRate?: number;
  regionType?: "rural" | "semi_urban" | "urban" | "unknown";
};

export async function trackEvent(
  toolName: "loan_checker" | "product_compare" | "health_assessment" | "cashbook" | "companion" | "locator" | "checklists" | "scenario_planner",
  data: TrackEventData = {}
): Promise<void> {
  const sessionId = getRotatingSessionId();
  const dateStr = new Date().toISOString().substring(0, 7); // YYYY-MM

  const payload = {
    session_id_rotating: sessionId,
    tool_name: toolName,
    intent_class: data.intentClass || null,
    amount_band: data.amount !== undefined ? binAmount(data.amount) : null,
    purpose_band: data.purposeBand || null,
    lender_type: data.lenderType || null,
    cost_band: binCostRate(data.costRate),
    region_type: data.regionType || "unknown",
    event_month: dateStr,
  };

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    await fetch(`${apiUrl}/api/events/binned`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[Analytics] Failed to send binned event:", err);
  }
}
