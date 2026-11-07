import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/server/airport-search";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("q") || "";
  if (keyword.length > 40) return NextResponse.json({ error: "Search term too long" }, { status: 400 });
  const result = await searchAirports(keyword);
  return NextResponse.json(result, { headers: { "Cache-Control": "public, max-age=30, s-maxage=120" } });
}
