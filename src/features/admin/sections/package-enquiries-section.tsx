import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Search, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { packageStatusLabels, packageStatusClasses } from "@/features/admin/lib/package-status";
import { currentStaff, canManage } from "@/server/auth";
import { loadPackageEnquiries, makePackageFilters, packageEnquiryOptions, packageFilterQuery, packageEnquiryMetrics } from "@/server/package-enquiry-data";
import { packageEnquiryStatuses } from "@/server/package-enquiry-schema";

export async function PackageEnquiriesSection({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  const filters = makePackageFilters(await searchParams);
  let data: Awaited<ReturnType<typeof loadPackageEnquiries>> = { rows: [], total: 0, pageSize: 20 };
  let options: Awaited<ReturnType<typeof packageEnquiryOptions>> = [];
  let metrics = { total: 0, newCount: 0, inProgress: 0 };
  let error = "";
  try {
    [data, options, metrics] = await Promise.all([
      loadPackageEnquiries(filters), packageEnquiryOptions(), packageEnquiryMetrics(),
    ]);
  } catch {
    error = "The package enquiry workspace is unavailable. Check the database migration and connection.";
  }
  const totalPages = Math.max(1, Math.ceil(data.total / 20));
  const exportQuery = packageFilterQuery(filters, 1);
  const statuses = packageEnquiryStatuses;

  return (
    <AdminShell user={staff}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Package reservations desk</p>
          <h1 className="display-heading mt-3 text-3xl">Package enquiries</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Every package request in one dedicated workspace, independent of general travel enquiries.
          </p>
        </div>
        {canManage(staff) && !error && (
          <a href={"/api/admin/package-enquiries/export" + (exportQuery ? "?" + exportQuery : "")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sapphire px-5 py-2 text-xs font-medium text-white">
            <Download size={15} /> Export for Excel (CSV)
          </a>
        )}
      </div>
      {error && <p role="alert" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">{error}</p>}
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        {([
          ["All package enquiries", metrics.total],
          ["New requests", metrics.newCount],
          ["In progress", metrics.inProgress],
        ] as const).map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#e5eaf2] bg-white p-5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-3xl font-medium tabular-nums text-navy">{value.toLocaleString("en-NG")}</p>
          </div>
        ))}
      </div>
      <form method="GET" action="/admin/package-enquiries" className="mb-6 grid gap-3 rounded-2xl border border-[#e4eaf3] bg-white p-5 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1.3fr_1fr_1fr_auto]">
        <label className="text-[11px] font-medium text-muted">Search
          <input name="q" maxLength={100} defaultValue={filters.q} className="input-field mt-1" placeholder="Name, email, phone, reference..."/>
        </label>
        <label className="text-[11px] font-medium text-muted">Status
          <select name="status" defaultValue={filters.status} className="input-field mt-1">
            <option value="all">All statuses</option>
            {statuses.map((status) => <option key={status} value={status}>{packageStatusLabels[status]}</option>)}
          </select>
        </label>
        <label className="text-[11px] font-medium text-muted">Package
          <select name="package" defaultValue={filters.package} className="input-field mt-1">
            <option value="">All packages</option>
            {options.map((item) => <option key={item.slug} value={item.slug}>{item.title} ({item.count})</option>)}
          </select>
        </label>
        <label className="text-[11px] font-medium text-muted">Submitted from
          <input name="from" type="date" defaultValue={filters.from} className="input-field mt-1"/>
        </label>
        <label className="text-[11px] font-medium text-muted">Submitted to
          <input name="to" type="date" defaultValue={filters.to} className="input-field mt-1"/>
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-sapphire px-4 text-xs font-medium text-white"><Search size={14}/> Apply</button>
          <Link href="/admin/package-enquiries" className="inline-flex h-11 items-center justify-center rounded-lg border border-[#e0e7f0] px-3 text-xs font-medium text-muted">Clear</Link>
        </div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-[#e4eaf2] bg-white">
        <div className="flex items-center justify-between border-b border-[#e9edf4] px-5 py-4">
          <h2 className="text-sm font-medium text-navy">Requests</h2>
          <span className="text-xs text-muted">{data.total.toLocaleString("en-NG")} matching</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-[12px]">
            <thead className="bg-[#f8faff] text-[11px] text-[#53637c]">
              <tr>
                {["Reference","Customer","Package","Travel date","Travellers","Status","Submitted",""].map((name, index) => (
                  <th key={index} className="whitespace-nowrap px-5 py-4 font-medium">{name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f6]">
              {data.rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#fbfcff]">
                  <td className="px-5 py-4 font-medium text-sapphire">{row.reference}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-navy">{row.name}</p>
                    <p className="mt-1 text-[11px] text-muted">{row.email}</p>
                  </td>
                  <td className="max-w-[230px] px-5 py-4 text-navy">{row.packageTitle}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{row.preferredDate}</td>
                  <td className="px-5 py-4 tabular-nums">{row.adults + row.children + row.infants}</td>
                  <td className="px-5 py-4">
                    <span className={"rounded-full px-3 py-1.5 text-[11px] font-medium " + packageStatusClasses[row.status]}>{packageStatusLabels[row.status]}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{new Date(row.createdAt).toLocaleDateString("en-NG")}</td>
                  <td className="px-5 py-4">
                    <Link href={"/admin/package-enquiries/" + row.id} aria-label={"Open " + row.reference} className="inline-flex items-center gap-1 text-xs font-medium text-sapphire">
                      Open <ArrowUpRight size={14}/>
                    </Link>
                  </td>
                </tr>
              ))}
              {!data.rows.length && (
                <tr><td colSpan={8} className="py-14 text-center text-sm text-muted">No package enquiries match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-muted">Page {Math.min(filters.page,totalPages)} of {totalPages}</p>
        <div className="flex gap-2">
          {filters.page > 1 && (
            <Link href={"/admin/package-enquiries?" + packageFilterQuery(filters,filters.page-1)} className="inline-flex items-center gap-1 rounded-full border border-[#dde6f0] px-4 py-2 text-xs text-sapphire"><ChevronLeft size={14}/> Previous</Link>
          )}
          {filters.page < totalPages && (
            <Link href={"/admin/package-enquiries?" + packageFilterQuery(filters,filters.page+1)} className="inline-flex items-center gap-1 rounded-full border border-[#dde6f0] px-4 py-2 text-xs text-sapphire">Next <ChevronRight size={14}/></Link>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
