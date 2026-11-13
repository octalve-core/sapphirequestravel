import "server-only";
import { db } from "@/server/db";
import type { PackageEnquiryFilters, PackageEnquiryStatus } from "@/server/package-enquiry-schema";

export type PackageEnquiryRow = {
  id: string;
  reference: string;
  packageSlug: string;
  packageTitle: string;
  destination: string;
  priceSnapshot: number | null;
  currency: string;
  preferredDate: string;
  departureCity: string;
  adults: number;
  children: number;
  infants: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
  status: PackageEnquiryStatus;
  assignedTo: string | null;
  assignedName: string | null;
  createdAt: string;
  updatedAt: string;
};

export function makePackageFilters(input: Record<string, string | string[] | undefined>): PackageEnquiryFilters {
  const first = (key: string) => typeof input[key] === "string" ? input[key] as string : undefined;
  const status = first("status") || "all";
  return {
    q: (first("q") || "").slice(0, 100),
    status: ["all", "new", "contacted", "quoted", "follow_up", "confirmed", "closed"].includes(status)
      ? status as PackageEnquiryFilters["status"] : "all",
    package: /^[a-z0-9-]{0,130}$/.test(first("package") || "") ? first("package") || "" : "",
    from: /^\d{4}-\d{2}-\d{2}$/.test(first("from") || "") ? first("from") || "" : "",
    to: /^\d{4}-\d{2}-\d{2}$/.test(first("to") || "") ? first("to") || "" : "",
    page: Math.min(Math.max(Number.parseInt(first("page") || "1", 10) || 1, 1), 100000),
  };
}

export function packageFilterQuery(filters: PackageEnquiryFilters, page = filters.page) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.package) params.set("package", filters.package);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}

export async function loadPackageEnquiries(filters: PackageEnquiryFilters, exportAll = false) {
  const sql = db();
  const searchTerm = "%" + filters.q.replace(/[%_\\]/g, "\\$&") + "%";
  const pageSize = exportAll ? 5001 : 20;
  const offset = exportAll ? 0 : (filters.page - 1) * 20;

  const rows = (await sql`
    SELECT e.id::text AS id, e.reference, e.package_slug AS "packageSlug",
      e.package_title AS "packageTitle", e.destination,
      e.price_snapshot::float AS "priceSnapshot", e.currency,
      e.preferred_date::text AS "preferredDate", e.departure_city AS "departureCity",
      e.adults, e.children, e.infants, e.name, e.email, e.phone,
      e.notes, e.status, e.assigned_to::text AS "assignedTo",
      u.name AS "assignedName", e.created_at::text AS "createdAt",
      e.updated_at::text AS "updatedAt"
    FROM package_enquiries e
    LEFT JOIN staff_users u ON u.id = e.assigned_to
    WHERE (${filters.status}='all' OR e.status=${filters.status})
      AND (${filters.package}='' OR e.package_slug=${filters.package})
      AND (${filters.from}='' OR e.created_at::date>=NULLIF(${filters.from},'')::date)
      AND (${filters.to}='' OR e.created_at::date<=NULLIF(${filters.to},'')::date)
      AND (${filters.q}='' OR e.reference ILIKE ${searchTerm} ESCAPE '\'
        OR e.name ILIKE ${searchTerm} ESCAPE '\'
        OR e.email ILIKE ${searchTerm} ESCAPE '\'
        OR e.phone ILIKE ${searchTerm} ESCAPE '\'
        OR e.package_title ILIKE ${searchTerm} ESCAPE '\')
    ORDER BY e.created_at DESC, e.id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `) as PackageEnquiryRow[];

  const counts = await sql`
    SELECT count(*)::int AS count FROM package_enquiries e
    WHERE (${filters.status}='all' OR e.status=${filters.status})
      AND (${filters.package}='' OR e.package_slug=${filters.package})
      AND (${filters.from}='' OR e.created_at::date>=NULLIF(${filters.from},'')::date)
      AND (${filters.to}='' OR e.created_at::date<=NULLIF(${filters.to},'')::date)
      AND (${filters.q}='' OR e.reference ILIKE ${searchTerm} ESCAPE '\'
        OR e.name ILIKE ${searchTerm} ESCAPE '\'
        OR e.email ILIKE ${searchTerm} ESCAPE '\'
        OR e.phone ILIKE ${searchTerm} ESCAPE '\'
        OR e.package_title ILIKE ${searchTerm} ESCAPE '\')
  `;
  return { rows, total: Number(counts[0]?.count || 0), pageSize: exportAll ? 5000 : pageSize };
}

export async function packageEnquiryOptions() {
  const sql = db();
  return (await sql`
    SELECT package_slug AS slug, max(package_title) AS title, count(*)::int AS count
    FROM package_enquiries GROUP BY package_slug ORDER BY title LIMIT 200
  `) as { slug: string; title: string; count: number }[];
}

export async function packageEnquiryMetrics() {
  const sql = db();
  const rows = await sql`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE status='new')::int AS new_count,
      count(*) FILTER (WHERE status IN ('contacted','quoted','follow_up'))::int AS in_progress
    FROM package_enquiries
  `;
  return {
    total: Number(rows[0]?.total || 0),
    newCount: Number(rows[0]?.new_count || 0),
    inProgress: Number(rows[0]?.in_progress || 0),
  };
}
