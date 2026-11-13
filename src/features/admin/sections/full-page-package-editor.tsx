import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { currentStaff, canManage } from "@/server/auth";
import { db } from "@/server/db";
import { packageSchema, type PackageRecord } from "@/server/package-schema";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { PackageFields } from "@/features/admin/components/package-fields";

export async function FullPagePackageEditor({ id }: { id?: string }) {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  if (!canManage(staff)) redirect("/admin/packages");

  let record: PackageRecord | undefined;
  let unavailable = false;
  if (id) {
    if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
    try {
      const sql = db();
      const rows = await sql`
        SELECT id, title, slug, summary, destination, status, highlights,
          price_amount::float AS "priceAmount", currency,
          discount_percent AS "discountPercent", features, images, details,
          rating_score::float AS "ratingScore", rating_count AS "ratingCount",
          rating_source AS "ratingSource"
        FROM travel_packages WHERE id=${id} LIMIT 1
      `;
      if (rows[0]) record = { ...packageSchema.parse(rows[0]), id: String(rows[0].id) };
    } catch { unavailable = true; }
    if (!record && !unavailable) notFound();
  }

  if (unavailable) return (
    <AdminShell user={staff}>
      <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        The package editor cannot access the package database. Verify migration 002 and the database connection, then try again.
      </div>
    </AdminShell>
  );

  return (
    <AdminShell user={staff}>
      <Link href="/admin/packages" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-sapphire">
        <ArrowLeft size={15} /> Back to packages
      </Link>
      <div className="mb-8">
        <p className="eyebrow">Package studio</p>
        <h1 className="display-heading mt-3 text-3xl">{record ? "Edit experience" : "Create a new experience"}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          Edit the full itinerary, starting price, guest feedback and photo gallery in one spacious workspace.
        </p>
      </div>
      <div className="max-w-[1180px] rounded-2xl border border-[#e4eaf3] bg-white p-5 sm:p-9 lg:p-11">
        <PackageFields initial={record} id={record?.id} />
      </div>
    </AdminShell>
  );
}
