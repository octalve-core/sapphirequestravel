import { NextRequest, NextResponse } from "next/server";
import { normalizeBannerPage } from "@/features/home/lib/banner-contract";
import { publishedBanner } from "@/server/banner-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const page = normalizeBannerPage(request.nextUrl.searchParams.get("page") ?? "");
  const banner = page ? await publishedBanner(page) : null;
  return NextResponse.json({ banner }, {
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
