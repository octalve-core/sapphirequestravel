import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { currentStaff, canManage } from "@/server/auth";
import { consentOrigin } from "@/server/security";
import { listManagedBanners, updateBanner, BannerMediaError } from "@/server/banner-media";
import { bannerDestinations } from "@/features/home/lib/banner-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const paths = bannerDestinations.map((item) => item.path) as [string, ...string[]];
const mutation = z.object({
  fileId: z.string().regex(/^[A-Za-z0-9_-]{12,100}$/),
  action: z.enum(["save", "publish", "unpublish"]),
  title: z.string().trim().min(4).max(180),
  href: z.enum(paths),
}).strict();

const headers = { "Cache-Control": "private, no-store" };
function unavailable(error: unknown) {
  return NextResponse.json({
    error: error instanceof BannerMediaError ? error.message : "Banner management is temporarily unavailable.",
  }, { status: 503, headers });
}

export async function GET() {
  const staff = await currentStaff();
  if (!staff || !canManage(staff)) return NextResponse.json({ error: "Not permitted" }, { status: 403, headers });
  try {
    return NextResponse.json({ banners: await listManagedBanners() }, { headers });
  } catch (error) {
    return unavailable(error);
  }
}

export async function PATCH(req: NextRequest) {
  if (!consentOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  const staff = await currentStaff();
  if (!staff || !canManage(staff)) return NextResponse.json({ error: "Not permitted" }, { status: 403, headers });
  if (Number(req.headers.get("content-length") || "0") > 8192) {
    return NextResponse.json({ error: "Request too large" }, { status: 413, headers });
  }
  const data = mutation.safeParse(await req.json().catch(() => null));
  if (!data.success) return NextResponse.json({ error: data.error.issues[0]?.message || "Invalid banner" }, { status: 422, headers });
  try {
    await updateBanner({
      fileId: data.data.fileId, action: data.data.action,
      title: data.data.title, href: data.data.href as typeof bannerDestinations[number]["path"],
    });
    revalidateTag("sapphire-banners", "max");
    revalidatePath("/");
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    return unavailable(error);
  }
}
