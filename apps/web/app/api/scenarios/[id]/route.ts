/**
 * DELETE /api/scenarios/[id]
 *
 * Port of apps/api/app/routers/scenarios.py → delete_scenario()
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: scenarioId } = await params;
  const userId = req.nextUrl.searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "user_id query param is required" }, { status: 422 });
  }

  try {
    const db = getSupabaseServer();

    const { data: scenario, error: findErr } = await db
      .from("saved_scenarios").select("id").eq("id", scenarioId).eq("user_id", userId).single();

    if (findErr || !scenario) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    const { error } = await db.from("saved_scenarios").delete().eq("id", scenarioId);
    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
