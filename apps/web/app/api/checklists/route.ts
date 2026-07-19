/**
 * GET /api/checklists
 *
 * Port of apps/api/app/routers/checklists.py → get_checklist()
 * Returns document checklists for a product category at a given institution.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const institutionId = searchParams.get("institution_id");
  const productCategory = searchParams.get("product_category");

  try {
    const db = getSupabaseServer();
    let query = db
      .from("document_checklists")
      .select(`
        id, product_category, checklist_bn, checklist_en, verified_at,
        institutions ( name_bn )
      `);

    if (institutionId) query = query.eq("institution_id", institutionId);
    if (productCategory) query = query.eq("product_category", productCategory);

    const { data: checklists, error } = await query;
    if (error) throw error;

    type Institution = { name_bn: string };
    type ChecklistRow = {
      id: string; product_category: string; checklist_bn: string[];
      verified_at: string; institutions: Institution | Institution[] | null;
    };

    const getInstitution = (inst: Institution | Institution[] | null): Institution | null =>
      Array.isArray(inst) ? (inst[0] ?? null) : inst;

    const data = (checklists as unknown as ChecklistRow[]).map((c) => ({
      id: c.id,
      institution_name_bn: getInstitution(c.institutions)?.name_bn ?? "সাধারণ",
      product_category: c.product_category,
      checklist_bn: c.checklist_bn,
      verified_at: c.verified_at,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/checklists]", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
