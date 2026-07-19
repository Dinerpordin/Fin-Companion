/**
 * POST /api/events/binned
 *
 * Port of apps/api/app/routers/events.py → record_event()
 *
 * Privacy-safe analytics — only accepts pre-binned data.
 * Raw financial values are rejected at the validation layer.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

const ALLOWED_TOOLS = new Set([
  "loan_checker", "product_compare", "health_assessment",
  "cashbook", "companion", "locator", "checklists", "scenario_planner",
]);
const ALLOWED_INTENTS = new Set([
  "loan_assessment", "loan_simulation", "product_comparison",
  "nearest_provider", "how_to_apply", "health_snapshot",
  "accounting_help", "financial_education", "out_of_scope",
]);
const ALLOWED_AMOUNT_BANDS = new Set(["under_10k", "10k_50k", "50k_200k", "200k_1m", "over_1m"]);
const ALLOWED_COST_BANDS = new Set(["low", "medium", "high", "very_high"]);
const FORBIDDEN_RAW_KEYS = new Set(["amount", "income", "expense", "loan_amount", "salary", "raw_value"]);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Reject raw financial keys
  for (const key of Object.keys(body)) {
    const lower = key.toLowerCase();
    if (!lower.includes("band") && [...FORBIDDEN_RAW_KEYS].some((f) => lower.includes(f))) {
      console.warn(`[events/binned] Privacy alert: blocked raw financial key '${key}'`);
      return NextResponse.json({ error: `Raw financial data not permitted. Forbidden key: ${key}` }, { status: 422 });
    }
  }

  const { session_id_rotating, tool_name, intent_class, amount_band,
    purpose_band, lender_type, cost_band, region_type, event_month } = body as Record<string, string | undefined>;

  if (!session_id_rotating || !tool_name || !event_month) {
    return NextResponse.json({ error: "session_id_rotating, tool_name, and event_month are required" }, { status: 422 });
  }
  if (!ALLOWED_TOOLS.has(tool_name)) return NextResponse.json({ error: `Unknown tool: ${tool_name}` }, { status: 422 });
  if (intent_class && !ALLOWED_INTENTS.has(intent_class)) return NextResponse.json({ error: `Unknown intent: ${intent_class}` }, { status: 422 });
  if (amount_band && !ALLOWED_AMOUNT_BANDS.has(amount_band)) return NextResponse.json({ error: `Invalid amount_band: ${amount_band}` }, { status: 422 });
  if (cost_band && !ALLOWED_COST_BANDS.has(cost_band)) return NextResponse.json({ error: `Invalid cost_band: ${cost_band}` }, { status: 422 });
  if (!/^\d{4}-\d{2}$/.test(event_month)) return NextResponse.json({ error: "event_month must be YYYY-MM" }, { status: 422 });

  try {
    const db = getSupabaseServer();
    const { error } = await db.from("analytics_events_binned").insert({
      session_id_rotating, tool_name, intent_class: intent_class ?? null,
      amount_band: amount_band ?? null, purpose_band: purpose_band ?? null,
      lender_type: lender_type ?? null, cost_band: cost_band ?? null,
      region_type: region_type ?? null, event_month,
    });
    if (error) throw error;
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/events/binned]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
