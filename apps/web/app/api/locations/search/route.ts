/**
 * GET /api/locations/search
 *
 * Port of apps/api/app/routers/locations.py → search_locations()
 *
 * Find nearest branches, agent banking outlets, and MFIs.
 * Query params: district, upazila, lat, lng, category, institution_type, limit
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/app/lib/supabaseServer";

/** Haversine distance in km — port of locations.py::haversine() */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const district = searchParams.get("district");
  const upazila = searchParams.get("upazila");
  const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
  const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
  const category = searchParams.get("category");
  const institutionType = searchParams.get("institution_type");
  const limit = Math.min(Number(searchParams.get("limit") ?? "10"), 30);

  try {
    const db = getSupabaseServer();

    let query = db
      .from("locations")
      .select(`
        id, location_type, branch_name, district, upazila, address_text,
        latitude, longitude, products_supported, phone_public, verified_at,
        institutions ( name_en, name_bn, institution_type )
      `)
      .limit(limit * 3); // fetch 3× to allow distance re-sort

    if (district) query = query.eq("district", district);
    if (upazila) query = query.eq("upazila", upazila);
    if (category) query = query.contains("products_supported", [category]);
    if (institutionType) query = query.eq("institutions.institution_type", institutionType);

    const { data: locations, error } = await query;
    if (error) throw error;

    type Institution = { name_en: string; name_bn: string; institution_type: string };
    type Loc = {
      id: string; location_type: string; branch_name: string; district: string;
      upazila: string | null; address_text: string | null; latitude: number | null;
      longitude: number | null; products_supported: string[]; phone_public: string | null;
      verified_at: string; institutions: Institution | Institution[] | null;
    };

    const getInst = (i: Institution | Institution[] | null): Institution | null =>
      Array.isArray(i) ? (i[0] ?? null) : i;

    const data = (locations as unknown as Loc[]).map((loc) => {
      const dist =
        lat !== null && lng !== null && loc.latitude !== null && loc.longitude !== null
          ? haversine(lat, lng, loc.latitude, loc.longitude)
          : null;
      return {
        id: loc.id,
        institution_name_en: getInst(loc.institutions)?.name_en ?? "",
        institution_name_bn: getInst(loc.institutions)?.name_bn ?? "",
        location_type: loc.location_type,
        branch_name: loc.branch_name,
        address_text: loc.address_text,
        district: loc.district,
        upazila: loc.upazila,
        phone_public: loc.phone_public,
        products_supported: loc.products_supported,
        distance_km: dist,
        verified_at: loc.verified_at,
      };
    });

    if (lat !== null && lng !== null) {
      data.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
    } else {
      data.sort((a, b) => b.verified_at.localeCompare(a.verified_at));
    }

    return NextResponse.json({ success: true, data: data.slice(0, limit), meta: { total: data.length } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/locations/search]", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
