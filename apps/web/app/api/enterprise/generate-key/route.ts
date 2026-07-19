/**
 * POST /api/enterprise/generate-key
 *
 * Port of apps/api/app/routers/enterprise.py → generate_api_key()
 * Generates a new API key for a user. Requires ENTERPRISE_ADMIN_SECRET.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ENTERPRISE_ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Enterprise key generation is disabled (ENTERPRISE_ADMIN_SECRET not configured)." }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || token !== adminSecret) {
    return NextResponse.json({ error: "Invalid or missing admin secret." }, { status: 401 });
  }

  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: "Invalid user_id" }, { status: 400 });
  }

  try {
    const db = getSupabaseServer();
    const { data: user, error: uErr } = await db.from("users").select("id").eq("id", userId).single();
    if (uErr || !user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newKey = crypto.randomBytes(16).toString("hex");
    const { error } = await db.from("users").update({ api_key: newKey }).eq("id", userId);
    if (error) throw error;

    return NextResponse.json({ success: true, api_key: newKey });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
