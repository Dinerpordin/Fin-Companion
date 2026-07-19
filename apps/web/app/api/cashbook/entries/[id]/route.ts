/**
 * DELETE /api/cashbook/entries/[id]
 *
 * Port of apps/api/app/routers/cashbook.py → delete_entry()
 * Deletes a cashbook entry belonging to the authenticated user.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: entryId } = await params;
  const userId = req.nextUrl.searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "user_id query param is required" }, { status: 422 });
  }

  try {
    const db = getSupabaseServer();

    const { data: entry, error: findErr } = await db
      .from("cashbook_entries")
      .select("id")
      .eq("id", entryId)
      .eq("user_id", userId)
      .single();

    if (findErr || !entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const { error } = await db.from("cashbook_entries").delete().eq("id", entryId);
    if (error) throw error;

    return new NextResponse(null, { status: 204 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[DELETE /api/cashbook/entries/${entryId}]`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
