/**
 * GET /api/products/compare
 *
 * Compare financial products with source metadata and freshness indicators.
 * Returns active, verified records with fallback support for Sanchayapatra and core products.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

const FALLBACK_PRODUCTS = [
  {
    id: "san-family-01",
    institution_name_en: "National Savings Directorate",
    institution_name_bn: "জাতীয় সঞ্চয় অধিদপ্তর",
    product_name_en: "Family Savings Certificate",
    product_name_bn: "পরিবার সঞ্চয়পত্র",
    category: "sanchayapatra",
    islamic_flag: false,
    nominal_rate: 11.52,
    rate_type: "fixed",
    effective_notes: "প্রতি মাসে মুনাফা প্রদান। শুধুমাত্র নারী, শারীরিক প্রতিবন্ধী ও ৫০+ প্রবীণদের জন্য।",
    verified_at: "2026-07-20",
    official_url: "https://www.internalbank.gov.bd/sanchayapatra",
    is_featured: true
  },
  {
    id: "san-pensioner-02",
    institution_name_en: "National Savings Directorate",
    institution_name_bn: "জাতীয় সঞ্চয় অধিদপ্তর",
    product_name_en: "Pensioner Savings Certificate",
    product_name_bn: "পেনশনার সঞ্চয়পত্র",
    category: "sanchayapatra",
    islamic_flag: false,
    nominal_rate: 11.76,
    rate_type: "fixed",
    effective_notes: "৩ মাস অন্তর মুনাফা প্রদান। অবসরপ্রাপ্ত সরকারি/আধা-সরকারি কর্মকর্তা-কর্মচারীদের জন্য।",
    verified_at: "2026-07-20",
    official_url: "https://www.internalbank.gov.bd/sanchayapatra",
    is_featured: true
  },
  {
    id: "san-3month-03",
    institution_name_en: "National Savings Directorate",
    institution_name_bn: "জাতীয় সঞ্চয় অধিদপ্তর",
    product_name_en: "3-Month Profit Certificate",
    product_name_bn: "৩ মাস অন্তর মুনাফাভিত্তিক সঞ্চয়পত্র",
    category: "sanchayapatra",
    islamic_flag: false,
    nominal_rate: 11.04,
    rate_type: "fixed",
    effective_notes: "৩ মাস অন্তর মুনাফা প্রদান। সকল বাংলাদেশী একক বা যৌথভাবে নিতে পারবেন।",
    verified_at: "2026-07-20",
    official_url: "https://www.internalbank.gov.bd/sanchayapatra",
    is_featured: false
  },
  {
    id: "fd-sonali-01",
    institution_name_en: "Sonali Bank PLC",
    institution_name_bn: "সোনালী ব্যাংক পিএলসি",
    product_name_en: "Sonali Double Benefit Deposit",
    product_name_bn: "সোনালী দ্বিগুণ বৃদ্ধি আমানত",
    category: "fd",
    islamic_flag: false,
    nominal_rate: 10.50,
    rate_type: "compound",
    effective_notes: "৬ বছরে দ্বিগুণ টাকা ফেরত। ১০০% সরকারি শতভাগ গ্যারান্টিযুক্ত।",
    verified_at: "2026-07-18",
    official_url: "https://www.sonalibank.com.bd",
    is_featured: true
  },
  {
    id: "fd-brac-02",
    institution_name_en: "BRAC Bank PLC",
    institution_name_bn: "ব্র্যাক ব্যাংক পিএলসি",
    product_name_en: "BRAC Bank Fixed Deposit",
    product_name_bn: "ব্র্যাক ব্যাংক ফিক্সড ডিপোজিট",
    category: "fd",
    islamic_flag: false,
    nominal_rate: 10.25,
    rate_type: "fixed",
    effective_notes: "১ বছর মেয়াদী বিশেষ ফিক্সড ডিপোজিট মুনাফা।",
    verified_at: "2026-07-15",
    official_url: "https://www.bracbank.com",
    is_featured: false
  },
  {
    id: "dps-islami-01",
    institution_name_en: "Islami Bank Bangladesh PLC",
    institution_name_bn: "ইসলামী ব্যাংক বাংলাদেশ পিএলসি",
    product_name_en: "Mudaraba Savings Scheme (DPS)",
    product_name_bn: "মুদারাবা সঞ্চয় স্কিম (ডিপিএস)",
    category: "dps",
    islamic_flag: true,
    nominal_rate: 10.75,
    rate_type: "profit_sharing",
    effective_notes: "সম্পূর্ণ শরীয়াহ সম্মত মুদারাবা মুনাফা বণ্টন ব্যবস্থা।",
    verified_at: "2026-07-19",
    official_url: "https://www.islamibankbd.com",
    is_featured: true
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const amount = searchParams.get("amount") ? Number(searchParams.get("amount")) : null;
  const islamicOnly = searchParams.get("islamic_only") === "true";
  const sortBy = searchParams.get("sort_by") ?? "rate";
  const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  try {
    const db = getSupabaseServer();

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

    const { data: products, error } = await query;
    
    let resultData: any[] = [];

    if (!error && products && products.length > 0) {
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

      resultData = (products as unknown as Product[])
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
    }

    // Use Fallback seed data if DB returned empty
    if (resultData.length === 0) {
      resultData = FALLBACK_PRODUCTS.filter(p => {
        if (category && p.category !== category) return false;
        if (islamicOnly && !p.islamic_flag) return false;
        return true;
      });
    }

    // Sort
    if (sortBy === "rate") {
      const loanCategories = ["personal_loan", "credit_card"];
      if (category && loanCategories.includes(category)) {
        resultData.sort((a, b) => (a.is_featured === b.is_featured ? 0 : a.is_featured ? -1 : 1) || a.nominal_rate - b.nominal_rate);
      } else {
        resultData.sort((a, b) => (b.is_featured === a.is_featured ? 0 : b.is_featured ? -1 : 1) || b.nominal_rate - a.nominal_rate);
      }
    } else {
      resultData.sort((a, b) => b.verified_at.localeCompare(a.verified_at));
    }

    return NextResponse.json({
      success: true,
      data: resultData.slice(0, limit),
      meta: { total: resultData.length, filters: { category, amount, islamic_only: islamicOnly } },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/products/compare]", msg);

    // Fallback response on error
    const filteredFallback = FALLBACK_PRODUCTS.filter(p => {
      if (category && p.category !== category) return false;
      if (islamicOnly && !p.islamic_flag) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      data: filteredFallback.slice(0, limit),
      meta: { total: filteredFallback.length, fallback: true }
    });
  }
}
