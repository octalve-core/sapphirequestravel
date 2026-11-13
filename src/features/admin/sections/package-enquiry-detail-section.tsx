import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Mail, Phone, Users } from "lucide-react";
import { db } from "@/server/db";
import { currentStaff, canEdit } from "@/server/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { PackageEnquiryActions } from "@/features/admin/components/package-enquiry-actions";
import { packageStatusClasses, packageStatusLabels } from "@/features/admin/lib/package-status";
import type { PackageEnquiryRow } from "@/server/package-enquiry-data";

type Event = { id: string; eventType: string; content: string; staffName: string | null; createdAt: string };
type StaffOption = { id: string; name: string };

export async function PackageEnquiryDetailSection({ id }: { id: string }) {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  let item: PackageEnquiryRow | undefined;
  let events: Event[] = [];
  let assignees: StaffOption[] = [];
  try {
    const sql = db();
    const [records, history, colleagues] = await Promise.all([
      sql`
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
        WHERE e.id=${id} LIMIT 1
      `,
      sql`
        SELECT e.id::text AS id, e.event_type AS "eventType",
          e.content, u.name AS "staffName", e.created_at::text AS "createdAt"
        FROM package_enquiry_events e
        LEFT JOIN staff_users u ON u.id=e.staff_id
        WHERE e.enquiry_id=${id} ORDER BY e.created_at DESC LIMIT 100
      `,
      sql`SELECT id::text AS id, name FROM staff_users WHERE active=true
        AND role IN ('owner','manager','agent') ORDER BY name LIMIT 100`,
    ]);
    item = records[0] as PackageEnquiryRow | undefined;
    events = history as Event[];
    assignees = colleagues as StaffOption[];
  } catch {
    return (
      <AdminShell user={staff}>
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Could not load this request. Check the package database migration and connection.
        </div>
      </AdminShell>
    );
  }
  if (!item) notFound();
  const money = item.priceSnapshot == null ? "Personalised" :
    new Intl.NumberFormat("en-NG", {style:"currency",currency:item.currency,maximumFractionDigits:0}).format(item.priceSnapshot);

  return (
    <AdminShell user={staff}>
      <Link href="/admin/package-enquiries" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-sapphire">
        <ArrowLeft size={15}/> All package enquiries
      </Link>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Request · {item.reference}</p>
          <h1 className="display-heading mt-3 text-3xl">Package enquiry</h1>
          <p className="mt-2 text-sm text-muted">{item.packageTitle}</p>
        </div>
        <span className={"rounded-full px-4 py-2 text-xs font-medium "+packageStatusClasses[item.status]}>{packageStatusLabels[item.status]}</span>
      </div>
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[#e3eaf3] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-medium text-navy">Customer details</h2>
            <p className="mt-4 text-xl font-medium text-navy">{item.name}</p>
            <a href={"mailto:"+item.email} className="mt-3 flex items-center gap-2 text-sm text-sapphire"><Mail size={15}/>{item.email}</a>
            <a href={"tel:"+item.phone.replace(/[^\d+]/g,"")} className="mt-3 flex items-center gap-2 text-sm text-sapphire"><Phone size={15}/>{item.phone}</a>
            <div className="mt-7 grid gap-5 border-t border-[#edf1f6] pt-6 sm:grid-cols-2">
              <div><p className="text-xs text-muted">Experience</p><p className="mt-1 text-sm font-medium text-navy">{item.packageTitle}</p></div>
              <div><p className="text-xs text-muted">Destination</p><p className="mt-1 text-sm font-medium text-navy">{item.destination}</p></div>
              <div><p className="flex items-center gap-1 text-xs text-muted"><CalendarDays size={13}/> Preferred travel date</p><p className="mt-1 text-sm font-medium text-navy">{item.preferredDate}</p></div>
              <div><p className="text-xs text-muted">Departing from</p><p className="mt-1 text-sm font-medium text-navy">{item.departureCity}</p></div>
              <div><p className="flex items-center gap-1 text-xs text-muted"><Users size={13}/> Travellers</p><p className="mt-1 text-sm font-medium text-navy">{item.adults} adults · {item.children} children · {item.infants} infants</p></div>
              <div><p className="text-xs text-muted">Advertised starting price at enquiry</p><p className="mt-1 text-sm font-medium text-navy">{money}</p></div>
              <div><p className="text-xs text-muted">Submitted</p><p className="mt-1 text-sm font-medium text-navy">{new Date(item.createdAt).toLocaleString("en-NG")}</p></div>
              <div><p className="text-xs text-muted">Assigned to</p><p className="mt-1 text-sm font-medium text-navy">{item.assignedName || "Unassigned"}</p></div>
            </div>
            {item.notes && <div className="mt-7 border-t border-[#edf1f6] pt-5"><p className="text-xs text-muted">Customer message</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-navy">{item.notes}</p></div>}
          </section>
          <section className="rounded-2xl border border-[#e3eaf3] bg-white p-6 sm:p-8">
            <h2 className="text-lg font-medium text-navy">Activity history</h2>
            <div className="mt-5 divide-y divide-[#edf1f6]">
              {events.map((event) => (
                <div key={event.id} className="py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium capitalize text-sapphire">{event.eventType.replace("_"," ")}</p>
                    <span className="text-[11px] text-muted">{new Date(event.createdAt).toLocaleString("en-NG")}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-navy">{event.content}</p>
                  {event.staffName && <p className="mt-1 text-[11px] text-muted">{event.staffName}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>
        {canEdit(staff) && (
          <div className="rounded-2xl border border-[#e3eaf3] bg-white p-6 sm:p-8">
            <PackageEnquiryActions
              id={item.id}
              status={item.status}
              assignedTo={item.assignedTo}
              assignees={assignees}
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
