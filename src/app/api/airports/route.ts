import { NextRequest, NextResponse } from "next/server";
import { searchAirports } from "@/server/airport-search";
import { consumeRateLimit, requestIp } from "@/server/security";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("q") || "";
  if (keyword.length > 40) return NextResponse.json({ error: "Search term too long" }, { status: 400 });
  if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    try { if (await consumeRateLimit(`airport-search:${requestIp(req)}`, 50, 5)) return NextResponse.json({ error: "Too many searches. Please try later." }, { status: 429 }); }
    catch { return NextResponse.json({ error: "Airport search is temporarily unavailable." }, { status: 503 }); }
  }
  const result = await searchAirports(keyword);
  return NextResponse.json(result, { headers: { "Cache-Control": "public, max-age=30, s-maxage=120" } });
}
