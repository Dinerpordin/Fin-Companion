/**
 * POST /api/leads
 *
 * Port of apps/api/app/routers/leads.py → submit_lead()
 * Captures user interest in a financial product.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function POST(req: NextRequest) {
  let body: { product_id: string; contact_phone: string; user_id?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { product_id, contact_phone, user_id } = body;
  if (!product_id || !contact_phone) {
    return NextResponse.json({ error: "product_id and contact_phone are required" }, { status: 422 });
  }

  try {
    const db = getSupabaseServer();

    // Verify product exists
    const { data: product, error: pErr } = await db
      .from("products").select("id").eq("id", product_id).single();
    if (pErr || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Verify user if provided
    let resolvedUserId: string | null = null;
    if (user_id) {
      const { data: user } = await db.from("users").select("id").eq("id", user_id).single();
      if (user) resolvedUserId = user_id;
    }

    const { data: lead, error } = await db
      .from("leads")
      .insert({ product_id, contact_phone, user_id: resolvedUserId, status: "pending" })
      .select().single();

    if (error) throw error;
    return NextResponse.json({
      success: true,
      data: { lead_id: lead.id, status: lead.status, created_at: lead.created_at },
      message: "Lead submitted successfully",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/leads]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
