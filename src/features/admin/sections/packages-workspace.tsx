import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Plus, PencilLine } from "lucide-react";
import { currentStaff, canManage } from "@/server/auth";
import { db } from "@/server/db";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { FestiveCollectionImport } from "@/features/admin/components/festive-collection-import";
import type { PackageRecord } from "@/server/package-schema";

export async function PackagesWorkspace() {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");

  let records: PackageRecord[] = [];
  let unavailable = "";
  try {
    const sql = db();
    records = (await sql`
      SELECT id, title, slug, summary, destination, status, highlights,
        price_amount::float AS "priceAmount", currency,
        discount_percent AS "discountPercent", features, images, details,
        rating_score::float AS "ratingScore", rating_count AS "ratingCount",
        rating_source AS "ratingSource"
      FROM travel_packages ORDER BY updated_at DESC LIMIT 200
    `) as PackageRecord[];
  } catch {
    unavailable = "Package editing needs the approved database migration 002. Your existing packages and enquiries have not been changed.";
  }

  return (
    <AdminShell user={staff}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow">Travel collection</p>
          <h1 className="display-heading mt-3 text-3xl">Package management</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Your experiences, pricing, galleries and verified guest ratings — organised in one place.
          </p>
        </div>
        {canManage(staff) && !unavailable && (
          <Link href="/admin/packages/new" className="inline-flex items-center gap-2 rounded-full bg-sapphire px-5 py-3 text-xs font-medium text-white">
            <Plus size={16} /> Create package
          </Link>
        )}
      </div>
      {unavailable && <p role="alert" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{unavailable}</p>}
      {canManage(staff) && !unavailable && <FestiveCollectionImport />}
      <div className="overflow-hidden rounded-2xl border border-[#e3eaf3] bg-white">
        <div className="flex items-center justify-between border-b border-[#e9edf3] px-6 py-5">
          <h2 className="text-base font-medium text-navy">Your packages</h2>
          <span className="text-xs text-muted">{records.length} packages</span>
        </div>
        <div className="divide-y divide-[#e9edf3]">
          {records.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-navy">{item.title}</p>
                <p className="mt-1 text-xs text-muted">{item.destination} · {item.currency} {item.priceAmount?.toLocaleString("en-NG") || "By enquiry"}</p>
                <p className="mt-1 text-[11px] text-muted">/{item.slug}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={"rounded-full px-3 py-1.5 text-[11px] font-medium " + (item.status === "published" ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-600")}>
                  {item.status === "published" ? "Published" : "Unpublished"}
                </span>
                {canManage(staff) && <Link href={"/admin/packages/" + item.id + "/edit"} className="inline-flex items-center gap-2 rounded-full border border-[#dce6f1] px-4 py-2.5 text-xs font-medium text-sapphire">
                  <PencilLine size={14} /> Edit <ArrowRight size={13} />
                </Link>}
              </div>
            </div>
          ))}
          {!records.length && !unavailable && (
            <p className="px-6 py-10 text-sm text-muted">Your package editor is ready. Add the festive collection or create a new experience.</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
