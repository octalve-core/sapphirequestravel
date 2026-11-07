"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowLeftRight, BriefcaseBusiness, CheckCircle2, ChevronDown, FileText, LoaderCircle, Minus, Palmtree, Plane, Plus, ShieldCheck, Trash2, Users, CalendarDays } from "lucide-react";
import { AirportCombobox } from "@/features/booking/components/airport-combobox";
import { Button } from "@/components/ui/button";

type Service = "flight" | "visa" | "holiday" | "corporate";
type Journey = "return" | "one-way" | "multi-city";
type Cabin = "economy" | "premium-economy" | "business" | "first";
type Leg = { id: number; origin: string; destination: string; date: string; swapRevision: number };
type Passengers = { adults: number; children: number; infants: number };
export type EnquiryInitial = { service?: Service; from?: string; to?: string; departure?: string; returnDate?: string; passengers?: number; packageSlug?: string };
const cabinNames: Record<Cabin, string> = { economy: "Economy", "premium-economy": "Premium Economy", business: "Business", first: "First Class" };
const services = [
  { key: "flight" as const, label: "Flights", icon: Plane },
  { key: "visa" as const, label: "Visas", icon: FileText },
  { key: "holiday" as const, label: "Trips & holidays", icon: Palmtree },
  { key: "corporate" as const, label: "Corporate travel", icon: BriefcaseBusiness },
];
const trips: { value: Journey; label: string }[] = [{ value: "return", label: "Round trip" }, { value: "one-way", label: "One way" }, { value: "multi-city", label: "Multi-city" }];
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const total = (p: Passengers) => p.adults + p.children + p.infants;
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
const maxLegs = 5;

function PassengerPicker({ value, onChange }: { value: Passengers; onChange: (p: Passengers) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    const esc = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", esc); };
  }, []);
  function change(kind: keyof Passengers, delta: number) {
    const next = { ...value, [kind]: value[kind] + delta };
    if (next.adults < 1 || next.children < 0 || next.infants < 0 || next.infants > next.adults || total(next) > 9) return;
    onChange(next);
  }
  return <div ref={root} className="relative min-w-0">
    <span className="mb-2 block text-[12px] font-semibold text-[#263752]">Passengers</span>
    <button type="button" onClick={() => setOpen(v => !v)} aria-haspopup="dialog" aria-expanded={open} className="input-field flex items-center justify-between gap-3 text-left text-[13px]">
      <span className="flex items-center gap-2"><Users size={15} className="text-sapphire"/>{total(value)} {total(value) === 1 ? "Passenger" : "Passengers"}</span><ChevronDown size={16} className="text-muted"/>
    </button>
    {open && <div role="dialog" aria-label="Choose passenger ages" className="absolute left-0 z-[90] mt-2 w-[min(360px,calc(100vw-48px))] rounded-2xl border border-[#e4eaf3] bg-white p-5 shadow-[0_20px_48px_-13px_rgba(6,26,54,.24)]">
      <p className="mb-4 text-[13px] font-semibold text-navy">Who is travelling?</p>
      {([
        { key: "adults" as const, label: "Adults", description: "12 years and above" },
        { key: "children" as const, label: "Children", description: "2–11 years" },
        { key: "infants" as const, label: "Infants", description: "Under 2 years" },
      ]).map(row => <div key={row.key} className="flex items-center justify-between gap-3 border-b border-[#eef2f7] py-3 last:border-0">
        <div><p className="text-sm font-semibold text-navy">{row.label}</p><p className="mt-0.5 text-[11px] text-muted">{row.description}</p></div>
        <div className="flex items-center gap-3">
          <button type="button" aria-label={`Remove ${row.label.toLowerCase()}`} disabled={value[row.key] <= (row.key === "adults" ? 1 : 0)} onClick={() => change(row.key, -1)} className="rounded-full border border-[#dce5f1] p-2 text-navy disabled:cursor-not-allowed disabled:opacity-30"><Minus size={14}/></button>
          <span className="w-4 text-center text-sm font-semibold tabular-nums">{value[row.key]}</span>
          <button type="button" aria-label={`Add ${row.label.toLowerCase()}`} disabled={total(value) >= 9 || (row.key === "infants" && value.infants >= value.adults)} onClick={() => change(row.key, 1)} className="rounded-full border border-[#dce5f1] p-2 text-navy disabled:cursor-not-allowed disabled:opacity-30"><Plus size={14}/></button>
        </div>
      </div>)}
      <p className="mt-3 text-[11px] leading-5 text-muted">Up to 9 passengers per enquiry. Each infant must travel with an adult. This is not a fare calculation.</p>
      <button type="button" onClick={() => setOpen(false)} className="mt-4 w-full rounded-xl bg-sapphire px-4 py-3 text-xs font-semibold text-white">Done</button>
    </div>}
  </div>;
}

export function EnquiryWizard({ initial = {}, embedded = false }: { initial?: EnquiryInitial; embedded?: boolean }) {
  const router = useRouter();
  const [service, setService] = useState<Service>(initial.service || "flight");
  const [step, setStep] = useState<1 | 2>(1);
  const [journey, setJourney] = useState<Journey>(initial.returnDate ? "return" : "one-way");
  const [cabinClass, setCabinClass] = useState<Cabin>("economy");
  const [passengers, setPassengers] = useState<Passengers>({ adults: Math.min(Math.max(initial.passengers || 1, 1), 9), children: 0, infants: 0 });
  const [directOnly, setDirectOnly] = useState(false);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [legs, setLegs] = useState<Leg[]>([{ id: 1, origin: initial.from || "", destination: initial.to || "", date: initial.departure || "", swapRevision: 0 }]);
  const nextId = useRef(2);
  const [returnDate, setReturnDate] = useState(initial.returnDate || "");
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: initial.packageSlug ? `Enquiry about package: ${initial.packageSlug}` : "", website: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const first = legs[0];
  const updateContact = <K extends keyof typeof contact>(key: K, v: (typeof contact)[K]) => setContact(p => ({ ...p, [key]: v }));
  const updateLeg = (id: number, key: "origin" | "destination" | "date", value: string) => setLegs(p => p.map(leg => leg.id === id ? { ...leg, [key]: value } : leg));
  const swapLeg = (id: number) => setLegs(p => p.map(leg => leg.id === id ? { ...leg, origin: leg.destination, destination: leg.origin, swapRevision: leg.swapRevision + 1 } : leg));

  function changeJourney(next: Journey) {
    setJourney(next); setError("");
    if (next === "multi-city" && legs.length < 2) {
      setLegs(old => [...old, { id: nextId.current++, origin: old[0]?.destination || "", destination: "", date: "", swapRevision: 0 }]);
    }
    if (next !== "return") setReturnDate("");
  }
  function addLeg() {
    if (legs.length >= maxLegs) return;
    setLegs(p => [...p, { id: nextId.current++, origin: p[p.length - 1]?.destination || "", destination: "", date: "", swapRevision: 0 }]);
  }
  function journeyValid(): string {
    if (service !== "flight") return contact.notes.trim().length < 6 ? "Please describe your travel requirements." : "";
    const relevant = journey === "multi-city" ? legs : [first];
    if (journey === "multi-city" && relevant.length < 2) return "Multi-city journeys need at least two flights.";
    let previousDate = "";
    for (const [index, leg] of relevant.entries()) {
      if (!/^[A-Z]{3}$/.test(leg.origin) || !/^[A-Z]{3}$/.test(leg.destination)) return `Choose both airports from the suggestions for flight ${index + 1}.`;
      if (leg.origin === leg.destination) return `Flight ${index + 1} cannot depart from and arrive at the same airport.`;
      if (!isDate(leg.date) || leg.date < today()) return `Choose a valid future departure date for flight ${index + 1}.`;
      if (previousDate && leg.date < previousDate) return "Later flights must depart on or after the previous flight date.";
      previousDate = leg.date;
    }
    if (journey === "return" && (!isDate(returnDate) || returnDate < first.date)) return "Choose a return date on or after departure.";
    if (passengers.infants > passengers.adults || total(passengers) > 9) return "Check passenger ages and the total traveller count.";
    return "";
  }
  function goNext(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const message = journeyValid(); setError(message); if (!message) setStep(2); }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const message = journeyValid();
    if (message) { setStep(1); setError(message); return; }
    if (!consent) { setError("Please agree to the privacy policy before sending your enquiry."); return; }
    setBusy(true); setError("");
    const activeLegs = journey === "multi-city" ? legs : [first];
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        ...contact, service, consent,
        origin: service === "flight" ? first.origin : "",
        destination: service === "flight" ? first.destination : "",
        departureDate: service === "flight" ? first.date : "",
        returnDate: service === "flight" && journey === "return" ? returnDate : "",
        travellers: service === "flight" ? total(passengers) : 1,
        flightRequest: service === "flight" ? { journey, cabinClass, passengers, directOnly, flexibleDates, legs: activeLegs.map(({ origin, destination, date }) => ({ origin, destination, date })), returnDate: journey === "return" ? returnDate : "" } : undefined,
      }) });
      const data: { ok?: boolean; reference?: string; error?: string } = await response.json();
      if (!response.ok || !data.ok || !data.reference) { setError(data.error || "We could not submit your enquiry. Please try again."); return; }
      router.push(`/thanks?ref=${encodeURIComponent(data.reference)}`);
    } catch { setError("We could not reach the travel team right now. Please contact us directly."); }
    finally { setBusy(false); }
  }

  const controlClass = "input-field text-[13px]";
  const flightLeg = (leg: Leg, index: number, secondary: boolean) => <div key={leg.id} className={secondary ? "relative rounded-2xl border border-[#e4eaf3] bg-[#fbfcff] p-4 sm:p-5" : ""}>
    {secondary && <div className="mb-4 flex items-center justify-between"><p className="text-[12px] font-semibold text-navy">Flight {index + 1}</p><button type="button" onClick={() => setLegs(old => old.filter(x => x.id !== leg.id))} disabled={legs.length <= 2} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 disabled:opacity-40"><Trash2 size={14}/> Remove</button></div>}
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(185px,.65fr)]">
      <div className="relative min-w-0"><AirportCombobox key={`origin-${leg.id}-${leg.swapRevision}`} id={`${embedded ? "home" : "request"}-origin-${leg.id}`} label="Departure from" value={leg.origin} onChange={v => updateLeg(leg.id, "origin", v)}/>
        {!secondary && <button type="button" aria-label="Swap departure and arrival airports" onClick={() => swapLeg(leg.id)} className="absolute -right-[25px] bottom-[9px] z-20 hidden size-9 items-center justify-center rounded-full border-2 border-white bg-sapphire text-white shadow-lg transition-transform hover:rotate-180 lg:flex"><ArrowLeftRight size={16}/></button>}</div>
      <AirportCombobox key={`destination-${leg.id}-${leg.swapRevision}`} id={`${embedded ? "home" : "request"}-destination-${leg.id}`} label="Arrival to" value={leg.destination} onChange={v => updateLeg(leg.id, "destination", v)}/>
      <div className="min-w-0"><label htmlFor={`${embedded ? "home" : "request"}-date-${leg.id}`} className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#263752]"><CalendarDays size={13} className="text-sapphire"/>Departure date</label><input type="date" required id={`${embedded ? "home" : "request"}-date-${leg.id}`} min={index ? legs[index - 1]?.date || today() : today()} className={controlClass} value={leg.date} onChange={e => updateLeg(leg.id, "date", e.target.value)}/></div>
    </div>
    {!secondary && <button type="button" onClick={() => swapLeg(leg.id)} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#e1e8f2] px-3 py-1.5 text-[11px] font-semibold text-sapphire lg:hidden"><ArrowLeftRight size={13}/> Swap airports</button>}
  </div>;

  return <section className={embedded ? "container-wide" : "w-full"} aria-label="Travel enquiry">
    <div className="surface-card soft-shadow overflow-visible">
      <div className="flex flex-wrap overflow-hidden rounded-t-[20px] border-b border-[#e7edf5] bg-[#f8faff] sm:flex-nowrap" role="tablist" aria-label="Travel service">
        {services.map(t => <button key={t.key} role="tab" type="button" aria-selected={service === t.key} onClick={() => { setService(t.key); setStep(1); setError(""); }} className={`flex min-h-[58px] flex-1 items-center justify-center gap-2 border-b-[3px] px-2 text-[11px] font-medium sm:text-[13px] ${service === t.key ? "border-sapphire bg-white text-sapphire" : "border-transparent text-muted hover:bg-white"}`}><t.icon size={16}/>{t.label}</button>)}
      </div>
      <form onSubmit={step === 1 ? goNext : submit} className="p-5 sm:p-7 lg:p-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Step {step} of 2</p><h2 className="mt-2 text-xl font-medium tracking-[-.035em] text-navy sm:text-2xl">{step === 1 ? (service === "flight" ? "Find your next journey" : "Tell us your travel plans") : "Your contact details"}</h2></div><div className="flex gap-1.5" aria-hidden="true"><span className="h-1.5 w-10 rounded-full bg-sapphire"/><span className={`h-1.5 w-10 rounded-full ${step === 2 ? "bg-sapphire" : "bg-[#d8e3f2]"}`}/></div></div>
        {step === 1 ? service === "flight" ? <>
          <fieldset className="mb-5 flex flex-wrap items-center gap-2"><legend className="sr-only">Journey type</legend>{trips.map(t => <label key={t.value} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors ${journey === t.value ? "border-sapphire bg-[#edf4ff] text-sapphire" : "border-[#e0e6f0] bg-white text-[#5d6880]"}`}><input type="radio" name={`${embedded ? "home" : "request"}-journey`} value={t.value} checked={journey === t.value} onChange={() => changeJourney(t.value)} className="accent-sapphire"/>{t.label}</label>)}</fieldset>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(145px,1fr)_minmax(150px,1fr)_minmax(180px,1.2fr)_auto] xl:items-end">
            <div><label htmlFor={`${embedded ? "home" : "request"}-cabin`} className="mb-2 block text-[12px] font-semibold text-[#263752]">Flight class</label><select className={controlClass} id={`${embedded ? "home" : "request"}-cabin`} value={cabinClass} onChange={e => setCabinClass(e.target.value as Cabin)}>{(Object.keys(cabinNames) as Cabin[]).map(key => <option key={key} value={key}>{cabinNames[key]}</option>)}</select></div>
            <PassengerPicker value={passengers} onChange={setPassengers}/>
            <div className="flex flex-wrap gap-4 pb-3 sm:col-span-2 xl:col-span-1"><label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#40506a]"><input type="checkbox" checked={directOnly} onChange={e => setDirectOnly(e.target.checked)} className="size-4 accent-sapphire"/>Direct only</label><label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#40506a]"><input type="checkbox" checked={flexibleDates} onChange={e => setFlexibleDates(e.target.checked)} className="size-4 accent-sapphire"/>±3 days flexible</label></div>
          </div>
          <div className="space-y-4">{flightLeg(first, 0, false)}</div>
          {journey === "return" && <div className="mt-4 max-w-[310px]"><label className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-[#263752]" htmlFor={`${embedded ? "home" : "request"}-return`}><CalendarDays size={13} className="text-sapphire"/>Return date</label><input type="date" required id={`${embedded ? "home" : "request"}-return`} min={first.date || today()} value={returnDate} onChange={e => setReturnDate(e.target.value)} className={controlClass}/></div>}
          {journey === "multi-city" && <div className="mt-6 rounded-2xl border border-[#e0e8f4] bg-[#f8faff] p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[13px] font-semibold text-navy">Additional flights</p><p className="mt-1 text-[11px] text-muted">Build your itinerary in travel order. Up to {maxLegs} legs.</p></div><span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-sapphire">{legs.length} flights</span></div><div className="space-y-3">{legs.slice(1).map((leg, index) => flightLeg(leg, index + 1, true))}</div><button type="button" disabled={legs.length >= maxLegs} onClick={addLeg} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#bfd2f0] bg-white px-4 py-3 text-xs font-semibold text-sapphire hover:bg-[#eef5ff] disabled:opacity-40"><Plus size={16}/> Add another flight</button></div>}
          <p className="mt-5 text-[11px] leading-5 text-muted">This is an agent-assisted flight enquiry, not a confirmed booking or live fare search. Direct flights and flexible dates are preferences, subject to availability.</p>
        </> : <div className="max-w-3xl"><label className="label-field" htmlFor="travel-description">Tell us about the {service === "visa" ? "visa" : service === "corporate" ? "group travel" : "holiday"} you are planning</label><textarea id="travel-description" required minLength={6} maxLength={3000} className="input-field min-h-32 resize-y py-3" value={contact.notes} onChange={e => updateContact("notes", e.target.value)} placeholder="Destination, purpose, dates, people and special requirements"/></div>
        : <>
          {service === "flight" && <div className="mb-6 rounded-2xl border border-[#dae7f8] bg-[#f7faff] p-4 sm:p-5"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[.12em] text-sapphire">Your journey summary</p><div className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-medium text-navy"><span>{trips.find(t => t.value === journey)?.label}</span><span>{cabinNames[cabinClass]}</span><span>{total(passengers)} passenger(s)</span></div><div className="mt-3 space-y-1 text-[12px] text-[#4e617e]">{(journey === "multi-city" ? legs : [first]).map((leg, i) => <p key={leg.id}>Flight {i + 1}: {leg.origin} → {leg.destination} · {leg.date}</p>)}{journey === "return" && <p>Return: {returnDate}</p>}</div></div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label-field" htmlFor="customer-name">Full name</label><input id="customer-name" className="input-field" required minLength={2} maxLength={100} autoComplete="name" value={contact.name} onChange={e => updateContact("name", e.target.value)}/></div>
            <div><label className="label-field" htmlFor="customer-email">Email address</label><input id="customer-email" type="email" className="input-field" required autoComplete="email" value={contact.email} onChange={e => updateContact("email", e.target.value)}/></div>
            <div className="sm:col-span-2"><label className="label-field" htmlFor="customer-phone">Telephone / WhatsApp</label><input id="customer-phone" type="tel" required autoComplete="tel" className="input-field" maxLength={30} placeholder="+234 ..." value={contact.phone} onChange={e => updateContact("phone", e.target.value)}/></div>
            <div className="sm:col-span-2"><label className="label-field" htmlFor="customer-notes">Additional preferences (optional)</label><textarea id="customer-notes" maxLength={3000} className="input-field min-h-28 resize-y py-3" value={contact.notes} onChange={e => updateContact("notes", e.target.value)} placeholder="Preferred airline, budget, accessibility requirements..."/></div>
            <div className="sr-only" aria-hidden="true"><label htmlFor="enquiry-website">Website</label><input id="enquiry-website" value={contact.website} onChange={e => updateContact("website", e.target.value)} tabIndex={-1} autoComplete="off"/></div>
            <label className="flex items-start gap-3 text-xs leading-6 text-muted sm:col-span-2"><input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 size-4 accent-sapphire"/><span>I agree to Sapphire Quest processing my details to respond to this enquiry, as explained in the <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-sapphire underline">privacy policy</a>.</span></label>
          </div>
        </>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#e9edf5] pt-5">
          {step === 2 ? <button type="button" disabled={busy} onClick={() => { setStep(1); setError(""); }} className="inline-flex items-center gap-2 text-sm font-semibold text-muted"><ArrowLeft size={16}/> Edit journey</button> : <p className="flex items-center gap-2 text-[11px] text-muted"><ShieldCheck size={15} className="text-sapphire"/> Supported personally by our travel team</p>}
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">{busy ? <><LoaderCircle size={15} className="animate-spin"/> Sending enquiry...</> : step === 1 ? <>Continue to personal details <ArrowRight size={16}/></> : <>Submit travel enquiry <CheckCircle2 size={16}/></>}</Button>
        </div>
      </form>
    </div>
  </section>;
}
