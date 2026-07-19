/**
 * GET  /api/enterprise/leads — list leads for authenticated partner
 *
 * Port of apps/api/app/routers/enterprise.py → get_enterprise_leads()
 * Scoped to leads belonging to the partner's user_id only.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "x-api-key header is required" }, { status: 401 });

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "50"), 200);
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0");

  try {
    const db = getSupabaseServer();

    // Authenticate partner via API key
    const { data: user, error: uErr } = await db
      .from("users").select("id, name").eq("api_key", apiKey).single();
    if (uErr || !user) return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });

    const { data: leads, error } = await db
      .from("leads")
      .select("id, product_id, contact_phone, status, created_at, products(name_en)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    type ProductJoin = { name_en: string };
    type Lead = {
      id: string; product_id: string; contact_phone: string;
      status: string; created_at: string;
      products: ProductJoin | ProductJoin[] | null;
    };

    const getProduct = (p: ProductJoin | ProductJoin[] | null): ProductJoin | null =>
      Array.isArray(p) ? (p[0] ?? null) : p;

    const data = (leads as unknown as Lead[]).map((l) => ({
      id: l.id,
      product_id: l.product_id,
      product_name: getProduct(l.products)?.name_en ?? null,
      contact_phone: l.contact_phone,
      status: l.status,
      created_at: l.created_at,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: { partner_name: user.name, total_leads: data.length },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
