/**
 * GET  /api/scenarios — list saved scenarios for a user
 * POST /api/scenarios — save a new scenario
 *
 * Port of apps/api/app/routers/scenarios.py
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("user_id");
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);
  const offset = Number(searchParams.get("offset") ?? "0");

  if (!userId) {
    return NextResponse.json({ error: "user_id is required" }, { status: 422 });
  }

  try {
    const db = getSupabaseServer();

    const { data: user, error: uErr } = await db.from("users").select("id").eq("id", userId).single();
    if (uErr || !user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data, error } = await db
      .from("saved_scenarios")
      .select("id, user_id, scenario_type, input_data, results, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: { user_id: string; scenario_type: string; input_data: object; results: object };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { user_id, scenario_type, input_data, results } = body;
  if (!user_id || !scenario_type || !input_data || !results) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  try {
    const db = getSupabaseServer();
    const { data: user, error: uErr } = await db.from("users").select("id").eq("id", user_id).single();
    if (uErr || !user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { data, error } = await db
      .from("saved_scenarios")
      .insert({ user_id, scenario_type, input_data, results })
      .select().single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
