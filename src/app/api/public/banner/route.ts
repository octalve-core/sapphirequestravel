import { NextResponse } from "next/server";
import { publishedBanner } from "@/server/banner-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const banner = await publishedBanner();
  return NextResponse.json({ banner }, {
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
