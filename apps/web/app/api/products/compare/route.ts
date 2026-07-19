/**
 * GET /api/products/compare
 *
 * TypeScript port of apps/api/app/routers/products.py → compare_products()
 *
 * Compare financial products with source metadata and freshness indicators.
 * Returns only active, verified records with their best rate.
 *
 * Query params:
 *   category      — fd | dps | savings | personal_loan | credit_card
 *   amount        — number (BDT), filters by min/max_amount
 *   tenor_months  — number, filters by min/max_tenor_months
 *   islamic_only  — boolean
 *   sort_by       — rate | verified_date
 *   limit         — number (max 50, default 20)
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const amount = searchParams.get("amount") ? Number(searchParams.get("amount")) : null;
  const tenorMonths = searchParams.get("tenor_months") ? Number(searchParams.get("tenor_months")) : null;
  const islamicOnly = searchParams.get("islamic_only") === "true";
  const sortBy = searchParams.get("sort_by") ?? "rate";
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  try {
    const db = getSupabaseServer();

    // Fetch products with institution and rates via Supabase joins
    let query = db
      .from("products")
      .select(`
        id, category, name_en, name_bn, description_short_bn,
        min_amount, max_amount, min_tenor_months, max_tenor_months,
        islamic_flag, official_url, status, is_featured,
        institutions ( name_en, name_bn ),
        product_rates ( id, rate_type, nominal_rate, effective_notes, verified_at, confidence_flag )
      `)
      .eq("status", "active");

    if (category) query = query.eq("category", category);
    if (islamicOnly) query = query.eq("islamic_flag", true);
    if (amount !== null) {
      query = query.or(`min_amount.is.null,min_amount.lte.${amount}`)
                   .or(`max_amount.is.null,max_amount.gte.${amount}`);
    }
    if (tenorMonths !== null) {
      query = query.or(`min_tenor_months.is.null,min_tenor_months.lte.${tenorMonths}`)
                   .or(`max_tenor_months.is.null,max_tenor_months.gte.${tenorMonths}`);
    }

    const { data: products, error } = await query;
    if (error) throw error;

    // Shape the response
    type Rate = { nominal_rate: number; rate_type: string; effective_notes: string | null; verified_at: string };
    type Institution = { name_en: string; name_bn: string };
    type Product = {
      id: string; category: string; name_en: string; name_bn: string;
      islamic_flag: boolean; official_url: string | null; is_featured: boolean;
      institutions: Institution | Institution[] | null;
      product_rates: Rate[];
    };

    const getInst = (i: Institution | Institution[] | null): Institution | null =>
      Array.isArray(i) ? (i[0] ?? null) : i;

    const data = (products as unknown as Product[])
      .filter((p) => p.product_rates && p.product_rates.length > 0)
      .map((p) => {
        const bestRate = p.product_rates.reduce((best, r) =>
          r.nominal_rate > best.nominal_rate ? r : best
        );
        return {
          id: p.id,
          institution_name_en: getInst(p.institutions)?.name_en ?? "",
          institution_name_bn: getInst(p.institutions)?.name_bn ?? "",
          product_name_en: p.name_en,
          product_name_bn: p.name_bn,
          category: p.category,
          islamic_flag: p.islamic_flag,
          nominal_rate: bestRate.nominal_rate,
          rate_type: bestRate.rate_type,
          effective_notes: bestRate.effective_notes,
          verified_at: bestRate.verified_at,
          official_url: p.official_url,
          is_featured: p.is_featured,
        };
      });

    // Sort
    if (sortBy === "rate") {
      const loanCategories = ["personal_loan", "credit_card"];
      if (category && loanCategories.includes(category)) {
        data.sort((a, b) => (a.is_featured === b.is_featured ? 0 : a.is_featured ? -1 : 1) || a.nominal_rate - b.nominal_rate);
      } else {
        data.sort((a, b) => (b.is_featured === a.is_featured ? 0 : b.is_featured ? -1 : 1) || b.nominal_rate - a.nominal_rate);
      }
    } else {
      data.sort((a, b) => b.verified_at.localeCompare(a.verified_at));
    }

    return NextResponse.json({
      success: true,
      data: data.slice(0, limit),
      meta: { total: data.length, filters: { category, amount, tenor_months: tenorMonths, islamic_only: islamicOnly } },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/products/compare]", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
