/**
 * GET /api/health
 * Simple health-check endpoint for uptime monitoring.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", service: "financial-companion-web" });
}
