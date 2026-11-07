"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, ArrowLeftRight, BriefcaseBusiness, CheckCircle2,
  ChevronDown, FileText, LoaderCircle, Minus, Palmtree, Plane,
  Plus, Trash2, Users,
} from "lucide-react";
import { AirportCombobox } from "@/features/booking/components/airport-combobox";
import { ServiceRequestFields } from "@/features/booking/components/service-request-fields";
import { serviceFields, serviceNames, isOtherService, selectionLabel, type Service, type OtherService, type ServiceSelection } from "@/features/booking/lib/service-options";
import { Button } from "@/components/ui/button";

type Journey = "return" | "one-way" | "multi-city";
type Cabin = "economy" | "premium-economy" | "business" | "first";
type Leg = { id: number; origin: string; destination: string; date: string; swapRevision: number };
type Passengers = { adults: number; children: number; infants: number };
export type EnquiryInitial = {
  service?: Service; from?: string; to?: string; departure?: string;
  returnDate?: string; passengers?: number; packageSlug?: string;
};
const cabins: Record<Cabin, string> = {
  economy: "Economy", "premium-economy": "Premium Economy", business: "Business", first: "First Class",
};
const tabs = [
  { key: "flight" as const, icon: Plane },
  { key: "holiday" as const, icon: Palmtree },
  { key: "visa" as const, icon: FileText },
  { key: "corporate" as const, icon: BriefcaseBusiness },
];
const journeys: { value: Journey; label: string }[] = [
  { value: "return", label: "Round trip" },
  { value: "one-way", label: "One way" },
  { value: "multi-city", label: "Multi-city" },
];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const isDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;
const count = (p: Passengers) => p.adults + p.children + p.infants;
const maxLegs = 5;
const createSelection = (service: OtherService, destination = "", startDate = "", travellers = 1): ServiceSelection => ({
  destination, startDate, travellers, category: serviceFields[service].categories[0].value,
});

function PassengerPicker({ value, onChange }: { value: Passengers; onChange: (p: Passengers) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  function change(key: keyof Passengers, amount: number) {
    const next = { ...value, [key]: value[key] + amount };
    if (next.adults < 1 || next.children < 0 || next.infants < 0 || next.infants > next.adults || count(next) > 9) return;
    onChange(next);
  }
  return <div ref={root} className="relative min-w-0">
    <span className="booking-label">Passengers</span>
    <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-label="Choose passengers" className="booking-input flex items-center justify-between gap-2 text-left">
      <span className="inline-flex min-w-0 items-center gap-2 truncate"><Users aria-hidden size={15} className="shrink-0 text-sapphire"/>{count(value)} {count(value) === 1 ? "passenger" : "passengers"}</span>
      <ChevronDown aria-hidden size={15} className="shrink-0 text-muted"/>
    </button>
    {open && <div role="group" aria-label="Passenger ages" className="absolute left-0 z-[120] mt-2 w-[min(330px,calc(100vw-48px))] rounded-xl border border-[#dfe7f2] bg-white p-4 shadow-[0_20px_48px_-13px_rgba(6,26,54,.24)]">
      {([
        { key: "adults" as const, label: "Adults", age: "12 years and over" },
        { key: "children" as const, label: "Children", age: "2–11 years" },
        { key: "infants" as const, label: "Infants", age: "Under 2 years" },
      ]).map(item => <div key={item.key} className="flex items-center justify-between gap-3 border-b border-[#eef1f6] py-3 last:border-0">
        <div><p className="text-[13px] font-semibold text-navy">{item.label}</p><p className="text-[11px] text-muted">{item.age}</p></div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label={`Remove ${item.label.toLowerCase()}`} disabled={value[item.key] <= (item.key === "adults" ? 1 : 0)} onClick={() => change(item.key, -1)} className="grid size-8 place-items-center rounded-full border border-[#dde6f0] disabled:opacity-35"><Minus size={14}/></button>
          <span className="w-5 text-center text-sm font-semibold tabular-nums">{value[item.key]}</span>
          <button type="button" aria-label={`Add ${item.label.toLowerCase()}`} disabled={count(value) >= 9 || (item.key === "infants" && value.infants >= value.adults)} onClick={() => change(item.key, 1)} className="grid size-8 place-items-center rounded-full border border-[#dde6f0] disabled:opacity-35"><Plus size={14}/></button>
        </div>
      </div>)}
      <p className="mt-2 text-[11px] text-muted">Up to 9 passengers. Each infant must accompany an adult.</p>
      <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full rounded-lg bg-sapphire px-4 py-2.5 text-xs font-semibold text-white">Done</button>
    </div>}
  </div>;
}

export function EnquiryWizard({ initial = {}, embedded = false }: { initial?: EnquiryInitial; embedded?: boolean }) {
  const router = useRouter();
  const [service, setService] = useState<Service>(initial.service || "flight");
  const [step, setStep] = useState<1 | 2>(1);
  const [journey, setJourney] = useState<Journey>("return");
  const [cabin, setCabin] = useState<Cabin>("economy");
  const [passengers, setPassengers] = useState<Passengers>({ adults: Math.min(Math.max(initial.passengers || 1, 1), 9), children: 0, infants: 0 });
  const [directOnly, setDirectOnly] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [legs, setLegs] = useState<Leg[]>([{ id: 1, origin: initial.from || "", destination: initial.to || "", date: initial.departure || "", swapRevision: 0 }]);
  const idCounter = useRef(2);
  const [returnDate, setReturnDate] = useState(initial.returnDate || "");
  const [other, setOther] = useState<Record<OtherService, ServiceSelection>>({
    visa: createSelection("visa", initial.service === "visa" ? initial.to : "", initial.service === "visa" ? initial.departure : "", initial.service === "visa" ? initial.passengers : 1),
    holiday: createSelection("holiday", initial.service === "holiday" ? initial.to : "", initial.service === "holiday" ? initial.departure : "", initial.service === "holiday" ? initial.passengers : 1),
    corporate: createSelection("corporate", initial.service === "corporate" ? initial.to : "", initial.service === "corporate" ? initial.departure : "", initial.service === "corporate" ? initial.passengers : 1),
  });
  const [contact, setContact] = useState({ name: "", email: "", phone: "", organisation: "", notes: initial.packageSlug ? `Enquiry about package: ${initial.packageSlug}` : "", website: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const first = legs[0];
  const prefix = embedded ? "home" : "request";
  const activeSelection = isOtherService(service) ? other[service] : undefined;
  const updateContact = <K extends keyof typeof contact>(key: K, value: (typeof contact)[K]) => setContact(p => ({ ...p, [key]: value }));
  const updateLeg = (id: number, key: "origin" | "destination" | "date", value: string) => setLegs(p => p.map(item => item.id === id ? { ...item, [key]: value } : item));
  const swapLeg = (id: number) => setLegs(p => p.map(item => item.id === id ? { ...item, origin: item.destination, destination: item.origin, swapRevision: item.swapRevision + 1 } : item));
  const changeService = (value: Service) => { setService(value); setStep(1); setError(""); };
  function changeJourney(value: Journey) {
    setJourney(value); setError("");
    if (value === "multi-city" && legs.length < 2) setLegs(p => [...p, { id: idCounter.current++, origin: p[0].destination, destination: "", date: "", swapRevision: 0 }]);
    if (value !== "return") setReturnDate("");
  }
  const addLeg = () => setLegs(p => p.length >= maxLegs ? p : [...p, { id: idCounter.current++, origin: p[p.length - 1].destination, destination: "", date: "", swapRevision: 0 }]);

  function validate(): string {
    if (service !== "flight") {
      const x = other[service];
      if (!/^[A-Z]{3}$/.test(x.destination)) return "Choose a destination from the airport suggestions.";
      if (!isDate(x.startDate) || x.startDate < today()) return "Choose a valid future travel date.";
      if (!Number.isInteger(x.travellers) || x.travellers < 1 || x.travellers > 30) return "Select the number of travellers.";
      if (!serviceFields[service].categories.some(opt => opt.value === x.category)) return "Choose a travel purpose or style.";
      return "";
    }
    const activeLegs = journey === "multi-city" ? legs : [first];
    if (journey === "multi-city" && activeLegs.length < 2) return "Multi-city journeys require at least two flights.";
    let prior = "";
    for (const [index, leg] of activeLegs.entries()) {
      if (!/^[A-Z]{3}$/.test(leg.origin) || !/^[A-Z]{3}$/.test(leg.destination)) return `Choose both airports for flight ${index + 1}.`;
      if (leg.origin === leg.destination) return `Choose different airports for flight ${index + 1}.`;
      if (!isDate(leg.date) || leg.date < today()) return `Choose a valid departure date for flight ${index + 1}.`;
      if (prior && leg.date < prior) return "Flights must be arranged in date order.";
      prior = leg.date;
    }
    if (journey === "return" && (!isDate(returnDate) || returnDate < first.date)) return "Choose a return date on or after departure.";
    if (passengers.infants > passengers.adults || count(passengers) > 9) return "Please check the passenger breakdown.";
    return "";
  }
  function next(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = validate(); setError(message);
    if (!message) setStep(2);
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const message = validate();
    if (message) { setStep(1); setError(message); return; }
    if (!consent) { setError("Please agree to the privacy policy before submitting."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contact, service, consent,
          origin: service === "flight" ? first.origin : "",
          destination: service === "flight" ? first.destination : activeSelection?.destination || "",
          departureDate: service === "flight" ? first.date : activeSelection?.startDate || "",
          returnDate: service === "flight" && journey === "return" ? returnDate : "",
          travellers: service === "flight" ? count(passengers) : activeSelection?.travellers || 1,
          flightRequest: service === "flight" ? {
            journey, cabinClass: cabin, passengers, directOnly, flexibleDates,
            legs: (journey === "multi-city" ? legs : [first]).map(({ origin, destination, date }) => ({ origin, destination, date })),
            returnDate: journey === "return" ? returnDate : "",
          } : undefined,
          serviceRequest: service !== "flight" ? { ...activeSelection, organisation: service === "corporate" ? contact.organisation : "" } : undefined,
        }),
      });
      const result: { ok?: boolean; error?: string; reference?: string } = await response.json();
      if (!response.ok || !result.ok || !result.reference) { setError(result.error || "Please try again."); return; }
      router.push(`/thanks?ref=${encodeURIComponent(result.reference)}`);
    } catch { setError("We couldn't submit your request. Please try again or contact us directly."); }
    finally { setBusy(false); }
  }

  function renderFlightLeg(leg: Leg, index: number) {
    const secondary = index > 0;
    return <div key={leg.id} className={secondary ? "rounded-xl border border-[#e6edf5] bg-[#fafcff] p-3 sm:p-4" : ""}>
      {secondary && <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-semibold text-navy">Flight {index + 1}</span><button type="button" disabled={legs.length <= 2} onClick={() => setLegs(p => p.filter(x => x.id !== leg.id))} className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 disabled:opacity-40"><Trash2 size={13}/> Remove</button></div>}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:items-end">
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] sm:items-end">
          <AirportCombobox key={`from-${leg.id}-${leg.swapRevision}`} id={`${prefix}-from-${leg.id}`} label={secondary ? "From" : "Departure from"} value={leg.origin} onChange={v => updateLeg(leg.id, "origin", v)}/>
          <button type="button" aria-label={`Swap flight ${index + 1} airports`} onClick={() => swapLeg(leg.id)} className="mx-auto flex size-9 items-center justify-center rounded-full border border-[#dbe7f8] bg-[#eff5ff] text-sapphire transition-colors hover:bg-[#dfeafe] sm:mb-[5px]"><ArrowLeftRight size={15}/></button>
          <AirportCombobox key={`to-${leg.id}-${leg.swapRevision}`} id={`${prefix}-to-${leg.id}`} label={secondary ? "To" : "Arrival to"} value={leg.destination} onChange={v => updateLeg(leg.id, "destination", v)}/>
        </div>
        <div className={`grid min-w-0 gap-3 ${journey === "return" && !secondary ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
          <div className="min-w-0"><label className="booking-label" htmlFor={`${prefix}-date-${leg.id}`}>Departure date</label><input className="booking-input" type="date" required id={`${prefix}-date-${leg.id}`} min={index > 0 ? legs[index - 1]?.date || today() : today()} value={leg.date} onChange={e => updateLeg(leg.id, "date", e.target.value)}/></div>
          {journey === "return" && !secondary && <div className="min-w-0"><label className="booking-label" htmlFor={`${prefix}-return`}>Return date</label><input className="booking-input" type="date" required id={`${prefix}-return`} min={leg.date || today()} value={returnDate} onChange={e => setReturnDate(e.target.value)}/></div>}
        </div>
      </div>
    </div>;
  }

  return <section aria-label="Travel enquiry" className={embedded ? "container-wide" : "w-full"}>
    <div className="surface-card soft-shadow overflow-visible">
      <div role="tablist" aria-label="Select a service" className="grid grid-cols-2 overflow-hidden rounded-t-[20px] border-b border-[#e6edf6] bg-[#f8faff] sm:grid-cols-4">
        {tabs.map(({ key, icon: Icon }) => <button key={key} type="button" role="tab" aria-selected={service === key} onClick={() => changeService(key)} className={`flex min-h-[52px] min-w-0 items-center justify-center gap-2 border-b-2 px-3 text-[12px] font-medium sm:text-[13px] ${service === key ? "border-sapphire bg-[#eef4ff] text-sapphire" : "border-transparent text-[#52627a] hover:bg-white"}`}>
          <Icon aria-hidden size={16} className="shrink-0"/><span className="truncate">{serviceNames[key]}</span>
        </button>)}
      </div>
      <form onSubmit={step === 1 ? next : submit} className="px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-[13px] font-semibold text-navy">{step === 1 ? (service === "flight" ? "Flight details" : `${serviceNames[service]} details`) : "Contact details"}</p><span className="text-[11px] font-medium text-muted">Step {step} of 2</span></div>
        {step === 1 ? service === "flight" ? <div className="space-y-4">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(130px,1fr)_minmax(135px,1fr)_minmax(160px,1.12fr)_minmax(190px,1.2fr)] xl:items-end">
            <div className="min-w-0"><label className="booking-label" htmlFor={`${prefix}-trip`}>Flight type</label><select className="booking-input" id={`${prefix}-trip`} value={journey} onChange={e => changeJourney(e.target.value as Journey)}>{journeys.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
            <div className="min-w-0"><label className="booking-label" htmlFor={`${prefix}-cabin`}>Flight class</label><select className="booking-input" id={`${prefix}-cabin`} value={cabin} onChange={e => setCabin(e.target.value as Cabin)}>{(Object.keys(cabins) as Cabin[]).map(key => <option key={key} value={key}>{cabins[key]}</option>)}</select></div>
            <PassengerPicker value={passengers} onChange={setPassengers}/>
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 pb-3 text-[12px] text-[#34435b] sm:col-span-2 xl:col-span-1">
              <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap"><input type="checkbox" className="size-4 accent-sapphire" checked={directOnly} onChange={e => setDirectOnly(e.target.checked)}/>Direct only</label>
              <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap"><input type="checkbox" className="size-4 accent-sapphire" checked={flexibleDates} onChange={e => setFlexibleDates(e.target.checked)}/>±3 days</label>
            </div>
          </div>
          {renderFlightLeg(first, 0)}
          {journey === "multi-city" && <div className="space-y-3 rounded-xl border border-[#e5ecf5] bg-[#fcfdff] p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3"><p className="text-[13px] font-semibold text-navy">Additional flights</p><span className="text-[11px] text-muted">{legs.length} of {maxLegs} flights</span></div>
            {legs.slice(1).map((leg, i) => renderFlightLeg(leg, i + 1))}
            <button type="button" disabled={legs.length >= maxLegs} onClick={addLeg} className="inline-flex items-center gap-2 rounded-lg border border-[#cfdff4] bg-white px-4 py-2.5 text-xs font-semibold text-sapphire hover:bg-[#eef4ff] disabled:opacity-40"><Plus size={15}/> Add another flight</button>
          </div>}
        </div> : <ServiceRequestFields idPrefix={prefix} minDate={today()} service={service} value={other[service]} onChange={value => setOther(p => ({ ...p, [service]: value }))}/> : <>
          <div className="mb-4 rounded-xl border border-[#e2eaf6] bg-[#f7faff] px-4 py-3 text-xs text-[#405373]">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-sapphire">Request summary</p>
            {service === "flight" ? <>
              <p className="font-semibold text-navy">{journeys.find(item => item.value === journey)?.label} · {cabins[cabin]} · {count(passengers)} {count(passengers) === 1 ? "passenger" : "passengers"}</p>
              {(journey === "multi-city" ? legs : [first]).map((leg, index) => <p className="mt-1" key={leg.id}>{journey === "multi-city" ? `Flight ${index + 1}: ` : ""}{leg.origin} → {leg.destination} · {leg.date}</p>)}
              {journey === "return" && <p className="mt-1">Return: {returnDate}</p>}
            </> : <p><span className="font-semibold text-navy">{other[service].destination}</span> · {other[service].startDate} · {other[service].travellers} {other[service].travellers === 1 ? "traveller" : "travellers"} · {selectionLabel(service, other[service].category)}</p>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="booking-label" htmlFor={`${prefix}-contact-name`}>Full name</label><input id={`${prefix}-contact-name`} required minLength={2} maxLength={100} autoComplete="name" className="booking-input" value={contact.name} onChange={e => updateContact("name", e.target.value)}/></div>
            <div><label className="booking-label" htmlFor={`${prefix}-contact-email`}>Email address</label><input id={`${prefix}-contact-email`} type="email" required maxLength={200} autoComplete="email" className="booking-input" value={contact.email} onChange={e => updateContact("email", e.target.value)}/></div>
            <div className={service === "corporate" ? "" : "sm:col-span-2"}><label className="booking-label" htmlFor={`${prefix}-contact-phone`}>Phone / WhatsApp</label><input id={`${prefix}-contact-phone`} type="tel" required maxLength={30} autoComplete="tel" className="booking-input" placeholder="+234..." value={contact.phone} onChange={e => updateContact("phone", e.target.value)}/></div>
            {service === "corporate" && <div><label className="booking-label" htmlFor={`${prefix}-contact-org`}>Organisation (optional)</label><input id={`${prefix}-contact-org`} maxLength={120} autoComplete="organization" className="booking-input" value={contact.organisation} onChange={e => updateContact("organisation", e.target.value)}/></div>}
            <div className="sm:col-span-2"><label className="booking-label" htmlFor={`${prefix}-contact-notes`}>Additional details (optional)</label><textarea id={`${prefix}-contact-notes`} maxLength={3000} className="booking-input min-h-[85px] resize-y py-3" placeholder="Budget, preferences or special requirements" value={contact.notes} onChange={e => updateContact("notes", e.target.value)}/></div>
            <div className="sr-only" aria-hidden="true"><label htmlFor={`${prefix}-website`}>Website</label><input id={`${prefix}-website`} tabIndex={-1} autoComplete="off" value={contact.website} onChange={e => updateContact("website", e.target.value)}/></div>
            <label className="flex items-start gap-2.5 text-[11px] leading-5 text-muted sm:col-span-2"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-sapphire"/><span>I agree to the use of my details for this request, as described in the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-sapphire underline">privacy policy</a>.</span></label>
          </div>
        </>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9edf4] pt-4">
          {step === 2 ? <button type="button" disabled={busy} onClick={() => { setStep(1); setError(""); }} className="inline-flex items-center gap-2 text-xs font-semibold text-sapphire"><ArrowLeft size={14}/> Edit details</button> : <p className="max-w-[480px] text-[11px] leading-5 text-muted">{service === "flight" ? "Direct flights and flexible dates are preferences, subject to availability." : ""}</p>}
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">{busy ? <><LoaderCircle size={15} className="animate-spin"/> Sending...</> : step === 1 ? <>Continue to personal details <ArrowRight size={15}/></> : <>Submit enquiry <CheckCircle2 size={15}/></>}</Button>
        </div>
      </form>
    </div>
  </section>;
}
