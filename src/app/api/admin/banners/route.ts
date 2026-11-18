import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { currentStaff, canManage } from "@/server/auth";
import { consentOrigin } from "@/server/security";
import { listManagedBanners, updateBanner, deleteBanner, BannerMediaError } from "@/server/banner-media";
import { bannerDestinations, bannerPages, type BannerDestination, type BannerPage } from "@/features/home/lib/banner-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const destinations = bannerDestinations.map((item) => item.path) as [string, ...string[]];
const pagePaths = bannerPages.map((item) => item.path) as [string, ...string[]];
const fileIdSchema = z.string().regex(/^[A-Za-z0-9_-]{12,100}$/);
const date = z.string().datetime({ offset: true }).nullable().refine((value) => {
  if (!value) return true;
  const time = Date.parse(value);
  return time >= Date.UTC(2020, 0, 1) && time <= Date.UTC(2100, 0, 1);
}, "Select a valid date between 2020 and 2100.");
const settings = z.object({
  pages: z.array(z.enum(pagePaths)).min(1).max(bannerPages.length)
    .refine((values) => new Set(values).size === values.length, "Duplicate page selection."),
  startAt: date,
  endAt: date,
  delaySeconds: z.number().int().min(0).max(30),
}).strict().superRefine((value, context) => {
  if (value.startAt && value.endAt && Date.parse(value.startAt) >= Date.parse(value.endAt)) {
    context.addIssue({ code: "custom", path: ["endAt"], message: "End time must be later than start time." });
  }
});
const edit = z.object({
  fileId: fileIdSchema,
  action: z.enum(["save", "publish", "unpublish"]),
  title: z.string().trim().min(4).max(180),
  href: z.enum(destinations),
  settings,
}).strict();
const removal = z.object({ fileId: fileIdSchema }).strict();
const headers = { "Cache-Control": "private, no-store" };
function unavailable(error: unknown) {
  return NextResponse.json({
    error: error instanceof BannerMediaError ? error.message : "Banner management is temporarily unavailable.",
  }, { status: 503, headers });
}
function changed() {
  revalidateTag("sapphire-banners", "max");
  revalidatePath("/");
}

export async function GET() {
  const staff = await currentStaff();
  if (!staff || !canManage(staff)) return NextResponse.json({ error: "Not permitted" }, { status: 403, headers });
  try { return NextResponse.json({ banners: await listManagedBanners() }, { headers }); }
  catch (error) { return unavailable(error); }
}

export async function PATCH(req: NextRequest) {
  if (!consentOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  const staff = await currentStaff();
  if (!staff || !canManage(staff)) return NextResponse.json({ error: "Not permitted" }, { status: 403, headers });
  if (Number(req.headers.get("content-length") || 0) > 8192) return NextResponse.json({ error: "Request too large" }, { status: 413, headers });
  const parsed = edit.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid banner" }, { status: 422, headers });
  try {
    await updateBanner({
      fileId: parsed.data.fileId,
      action: parsed.data.action,
      title: parsed.data.title,
      href: parsed.data.href as BannerDestination,
      settings: {
        pages: parsed.data.settings.pages as BannerPage[],
        startAt: parsed.data.settings.startAt,
        endAt: parsed.data.settings.endAt,
        delaySeconds: parsed.data.settings.delaySeconds,
      },
    });
    changed();
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) { return unavailable(error); }
}

export async function DELETE(req: NextRequest) {
  if (!consentOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403, headers });
  const staff = await currentStaff();
  if (!staff || !canManage(staff)) return NextResponse.json({ error: "Not permitted" }, { status: 403, headers });
  if (Number(req.headers.get("content-length") || 0) > 2048) return NextResponse.json({ error: "Request too large" }, { status: 413, headers });
  const parsed = removal.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid banner ID" }, { status: 422, headers });
  try {
    await deleteBanner(parsed.data.fileId);
    changed();
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) { return unavailable(error); }
}
