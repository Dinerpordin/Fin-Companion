/**
 * GET  /api/cashbook/entries — list entries for a user
 * POST /api/cashbook/entries — create a new entry
 *
 * Port of apps/api/app/routers/cashbook.py
 *
 * Auth: user_id is read from query params (matching current MVP behaviour).
 * Future: replace with Supabase Auth JWT for full Row Level Security.
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

    // Verify user exists
    const { data: user, error: userErr } = await db
      .from("users").select("id").eq("id", userId).single();
    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: entries, error } = await db
      .from("cashbook_entries")
      .select("id, user_id, amount, entry_type, category, date, note, created_at")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return NextResponse.json(entries);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[GET /api/cashbook/entries]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: {
    user_id: string; amount: number; entry_type: string;
    category: string; date: string; note?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { user_id, amount, entry_type, category, date, note } = body;

  if (!user_id || !amount || amount <= 0 || !["income", "expense"].includes(entry_type) || !category || !date) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 422 });
  }

  try {
    const db = getSupabaseServer();

    // Verify user exists
    const { data: user, error: userErr } = await db
      .from("users").select("id").eq("id", user_id).single();
    if (userErr || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: entry, error } = await db
      .from("cashbook_entries")
      .insert({ user_id, amount, entry_type, category, date, note: note ?? null })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(entry, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/cashbook/entries]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
