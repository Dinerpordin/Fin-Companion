/**
 * GET /api/products/[id]
 *
 * Port of apps/api/app/routers/products.py → get_product()
 * Full product detail with rates, fees, and source information.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ success: false, error: "Invalid product ID format" }, { status: 400 });
  }

  try {
    const db = getSupabaseServer();
    const { data: product, error } = await db
      .from("products")
      .select(`
        id, institution_id, category, name_en, name_bn, description_short_bn,
        min_amount, max_amount, min_tenor_months, max_tenor_months,
        islamic_flag, official_url, status, is_featured,
        institutions ( name_en, name_bn ),
        product_rates ( id, rate_type, nominal_rate, effective_notes, verified_at, confidence_flag ),
        product_fees ( id, fee_name, fee_amount, fee_type, notes, verified_at )
      `)
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error || !product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    type Institution = { name_en: string; name_bn: string };
    const rawInst = product.institutions as Institution | Institution[] | null;
    const inst: Institution | null = Array.isArray(rawInst) ? (rawInst[0] ?? null) : rawInst;

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        institution_id: product.institution_id,
        institution_name_en: inst?.name_en ?? "",
        institution_name_bn: inst?.name_bn ?? "",
        category: product.category,
        name_en: product.name_en,
        name_bn: product.name_bn,
        description_short_bn: product.description_short_bn,
        min_amount: product.min_amount,
        max_amount: product.max_amount,
        min_tenor_months: product.min_tenor_months,
        max_tenor_months: product.max_tenor_months,
        islamic_flag: product.islamic_flag,
        official_url: product.official_url,
        status: product.status,
        is_featured: product.is_featured,
        rates: (product.product_rates ?? []).map((r: Record<string, unknown>) => ({
          id: r.id, rate_type: r.rate_type, nominal_rate: r.nominal_rate,
          effective_notes: r.effective_notes, verified_at: r.verified_at, confidence_flag: r.confidence_flag,
        })),
        fees: (product.product_fees ?? []).map((f: Record<string, unknown>) => ({
          id: f.id, fee_name: f.fee_name, fee_amount: f.fee_amount,
          fee_type: f.fee_type, notes: f.notes, verified_at: f.verified_at,
        })),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[/api/products/${id}]`, msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
