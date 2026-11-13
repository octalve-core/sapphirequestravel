import Link from "next/link";
import {
  ArrowLeft, CalendarDays, CheckCircle2, ClipboardList, Clock3, Home,
  Mail, MapPin, MessageSquareText, Phone, Plane, Repeat2, UserRound,
  UsersRound, SlidersHorizontal,
} from "lucide-react";
import type { EnquiryRow } from "@/server/admin-data";
import { describeAirport, airportDisplay } from "@/server/airport-lookup";
import { parseFlightDetails } from "@/features/admin/lib/enquiry-itinerary";
import { StatusBadge } from "@/features/admin/components/status-badge";
import { EnquiryActions } from "@/features/admin/components/enquiry-actions";
import { EnquiryDetailTools } from "@/features/admin/components/enquiry-detail-tools";

export type EnquiryEvent = {
  id: string; event_type: string; content: string; created_at: string; actor: string | null;
};
export type EnquiryStaff = { id: string; name: string };

function dateLabel(value: string | null | undefined): string {
  if (!value) return "Not specified";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + "T12:00:00Z") : new Date(value);
  return Number.isNaN(date.getTime()) ? value :
    date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
function timestamp(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value :
    date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }) + " WAT";
}
const services: Record<string,string> = {
  flight: "Flight", corporate: "Corporate travel", holiday: "Tours", visa: "Visa assistance",
};
const sectionStyle = "rounded-[19px] border border-[#e2e9f3] bg-white p-5 shadow-[0_12px_35px_rgba(12,38,82,.045)] sm:p-6";

export function EnquiryDetailView({ enquiry: e, events, agents, editable }: {
  enquiry: EnquiryRow; events: EnquiryEvent[]; agents: EnquiryStaff[]; editable: boolean;
}) {
  const details = parseFlightDetails(e.service, e.notes, e.origin, e.destination, e.departure_date, e.return_date);
  const isFlight = e.service === "flight";
  const passengerBreakdown = details.adults === null
    ? e.travellers + (e.travellers === 1 ? " traveller" : " travellers")
    : [details.adults + (details.adults === 1 ? " adult" : " adults"),
       details.children ? details.children + " children" : "",
       details.infants ? details.infants + " infants" : ""].filter(Boolean).join(" · ");
  const tel = e.phone.replace(/[^\d+]/g, "");
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email) ? e.email : null;
  return <div className="enquiry-detail-print space-y-7">
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[12px] text-[#6a7990]">
      <Link href="/admin" className="inline-flex items-center gap-2 hover:text-sapphire">
        <Home size={16} aria-hidden="true"/> Operations dashboard
      </Link><span aria-hidden="true">/</span>
      <Link href="/admin/enquiries" className="hover:text-sapphire">Enquiries</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page" className="font-medium text-navy">Enquiry details</span>
    </nav>
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[.14em] text-sapphire">Enquiry detail</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="min-w-0 break-all text-[clamp(1.45rem,3.1vw,2.4rem)] font-medium tracking-[-.05em] text-[#0a2352]">{e.reference}</h1>
          <StatusBadge status={e.status}/>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#52627d]">
          <span className="inline-flex items-center gap-2"><CalendarDays size={15} aria-hidden="true"/>Received {timestamp(e.created_at)}</span>
          <span className="inline-flex items-center gap-2"><UsersRound size={15} aria-hidden="true"/>{passengerBreakdown}</span>
          <span className="inline-flex items-center gap-2"><ClipboardList size={15} aria-hidden="true"/>{services[e.service] || e.service}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <EnquiryDetailTools reference={e.reference}/>
        <Link href="/admin/enquiries" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d9e4f2] bg-white px-4 text-[12px] font-medium text-[#385377] hover:border-sapphire hover:text-sapphire print:hidden">
          <ArrowLeft size={15} aria-hidden="true"/> All enquiries
        </Link>
      </div>
    </header>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,.92fr)]">
      <div className="min-w-0 space-y-5">
        <section className={sectionStyle} aria-labelledby="customer-heading">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#eaf3ff] text-sapphire"><UserRound size={20} aria-hidden="true"/></span>
            <h2 id="customer-heading" className="text-[16px] font-medium text-navy">Customer details</h2>
          </div>
          <p className="text-[17px] font-medium tracking-[-.025em] text-navy sm:pl-[52px]">{e.name}</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-[12px] sm:pl-[52px]">
            {email ? <a href={"mailto:" + email} className="inline-flex min-w-0 items-center gap-2 text-sapphire hover:underline"><Mail size={16} className="shrink-0"/><span className="break-all">{e.email}</span></a> : <span>{e.email}</span>}
            {tel ? <a href={"tel:" + tel} className="inline-flex items-center gap-2 text-sapphire hover:underline"><Phone size={16}/>{e.phone}</a> : <span>{e.phone}</span>}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#eaf0f7] pt-5">
            {email ? <a href={"mailto:" + email} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dce6f3] text-[12px] font-medium text-navy hover:bg-[#f2f7ff]"><MessageSquareText size={16}/>Message client</a> : <span/>}
            {tel ? <a href={"tel:" + tel} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#dce6f3] text-[12px] font-medium text-navy hover:bg-[#f2f7ff]"><Phone size={16}/>Call client</a> : <span/>}
          </div>
        </section>

        <section className={sectionStyle} aria-labelledby="trip-heading">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#eaf3ff] text-sapphire"><Plane size={20} aria-hidden="true"/></span>
            <h2 id="trip-heading" className="text-[16px] font-medium text-navy">Trip overview</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-5 border-b border-[#eaf0f7] pb-6 sm:grid-cols-4">
            {([
              ["Service", services[e.service] || e.service],
              ["Journey type", isFlight ? details.journey || "Not recorded" : "Travel request"],
              [isFlight ? "Cabin class" : "Requested date", isFlight ? details.cabin || "Not recorded" : dateLabel(e.departure_date)],
              ["Travellers", passengerBreakdown],
            ] as const).map(([label,value])=><div key={label} className="min-w-0">
              <dt className="text-[11px] text-[#64758e]">{label}</dt>
              <dd className="mt-1 break-words text-[13px] font-medium leading-6 text-navy">{value}</dd>
            </div>)}
          </dl>
          {isFlight ? <div className="mt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[14px] font-medium text-navy">Flight itinerary</h3>
              {details.flexibleDates !== null && <span className="inline-flex items-center gap-2 rounded-lg bg-[#edf8f2] px-3 py-2 text-[11px] font-medium text-[#20764e]">
                <CalendarDays size={14}/>Flexible dates (±3 days): {details.flexibleDates ? "Yes" : "No"}
              </span>}
            </div>
            {details.legs.length ? <ol className="overflow-hidden rounded-xl border border-[#dfe9f5]">
              {details.legs.map((leg,index)=>{
                const from=airportDisplay(leg.origin),to=airportDisplay(leg.destination);
                return <li key={index} className="grid gap-2 border-b border-[#e2ebf6] bg-[#fafcff] p-3 last:border-b-0 sm:grid-cols-[86px_minmax(0,1fr)_auto] sm:items-center sm:px-4 sm:py-3.5">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-[11px] font-medium text-[#496080]">
                    <span className="grid size-7 place-items-center rounded-lg bg-[#e4f0ff] text-sapphire"><Plane size={15}/></span>Flight {leg.number}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-[#0a2352]">
                      <span>{from.city} <span className="text-sapphire">({from.code})</span></span><span aria-hidden="true">→</span>
                      <span>{to.city} <span className="text-sapphire">({to.code})</span></span>
                    </span>
                    {(!from.known || !to.known) && <span className="mt-1 block text-[11px] text-amber-700">City not available for one of the airport codes; verify manually.</span>}
                  </span>
                  <span className="inline-flex items-center gap-2 whitespace-nowrap text-[11px] text-[#4c5b76]"><CalendarDays size={14}/>{dateLabel(leg.date)}</span>
                </li>;
              })}
            </ol> : <p className="rounded-xl bg-[#f7f9fc] p-4 text-sm text-muted">No flight itinerary was recorded.</p>}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#4f627e]">
              {details.returnDate && <span className="inline-flex items-center gap-2"><Repeat2 size={15} className="text-sapphire"/>Requested return: {dateLabel(details.returnDate)}</span>}
              {details.directOnly !== null && <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-sapphire"/>Direct only preference: {details.directOnly ? "Yes" : "No"}</span>}
            </div>
          </div> : <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><p className="text-[11px] text-muted">{e.service==="corporate"?"Preferred nearby airport":"Destination airport"}</p><p className="mt-1 flex items-center gap-2 text-[13px] font-medium text-navy"><MapPin size={15} className="text-sapphire"/>{describeAirport(e.destination)}</p></div>
            <div><p className="text-[11px] text-muted">Preferred travel date</p><p className="mt-1 inline-flex items-center gap-2 text-[13px] font-medium text-navy"><CalendarDays size={15} className="text-sapphire"/>{dateLabel(e.departure_date)}</p></div>
          </div>}
          <div className="mt-6 rounded-xl bg-[#edf4ff] px-4 py-4">
            <p className="flex items-center gap-2 text-[12px] font-medium text-navy"><MessageSquareText size={17} className="text-sapphire"/>{isFlight ? "Customer message" : "Travel details and notes"}</p>
            <p className="mt-2 whitespace-pre-wrap break-words text-[12px] leading-6 text-[#38506f]">
              {(isFlight?details.message:e.notes)?.trim() || "No additional message provided."}
            </p>
          </div>
        </section>
      </div>

      <section aria-labelledby="manage-heading" className={sectionStyle}>
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#eaf3ff] text-sapphire"><SlidersHorizontal size={20} aria-hidden="true"/></span>
          <h2 id="manage-heading" className="text-[16px] font-medium text-navy">Enquiry management</h2>
        </div>
        <EnquiryActions id={e.id} email={e.email} phone={e.phone} status={e.status} assignedTo={e.assigned_to} agents={agents} editable={editable}/>
        <div className="mt-7 border-t border-[#e7edf5] pt-6">
          <h3 className="mb-5 inline-flex items-center gap-2 text-[14px] font-medium text-navy"><Clock3 size={18} className="text-sapphire"/>Activity history</h3>
          <ol className="relative ml-2 space-y-6 border-l-2 border-[#dce8f9] pl-6">
            {events.map(event => <li key={event.id} className="relative">
              <span className="absolute -left-[31px] top-1 size-3 rounded-full border-[3px] border-white bg-sapphire ring-1 ring-[#c5d9f9]" aria-hidden="true"/>
              <p className="text-[12px] font-medium capitalize text-navy">{event.event_type.replaceAll("_"," ")}</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[12px] leading-6 text-[#485a74]">{event.content}</p>
              <p className="mt-1 text-[11px] text-muted">{event.actor || "System"} · {timestamp(event.created_at)}</p>
            </li>)}
            {!events.length && <li className="text-[12px] text-muted">No activity recorded yet.</li>}
          </ol>
        </div>
      </section>
    </div>
  </div>;
}
