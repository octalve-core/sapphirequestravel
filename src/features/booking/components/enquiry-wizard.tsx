"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Loader2, Palmtree, Plane } from "lucide-react";
import { AirportCombobox } from "@/features/booking/components/airport-combobox";
import { Button } from "@/components/ui/button";

type Service = "flight" | "visa" | "holiday" | "corporate";
type Trip = "return" | "one-way";
const tabs = [
  { key: "flight" as const, label: "Flights", icon: Plane },
  { key: "visa" as const, label: "Visas", icon: FileText },
  { key: "holiday" as const, label: "Trips & holidays", icon: Palmtree },
  { key: "corporate" as const, label: "Corporate travel", icon: BriefcaseBusiness },
];
export type EnquiryInitial = { service?: Service; from?: string; to?: string; departure?: string; returnDate?: string; passengers?: number; packageSlug?: string };
const dateToday = () => { const today=new Date();return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`; };
export function EnquiryWizard({ initial = {}, embedded = false }: { initial?: EnquiryInitial; embedded?: boolean }) {
  const router = useRouter();
  const [service, setService] = useState<Service>(initial.service || "flight");
  const [step, setStep] = useState<1 | 2>(1);
  const [trip, setTrip] = useState<Trip>(initial.returnDate ? "return" : "one-way");
  const [form, setForm] = useState({
    origin: initial.from || "", destination: initial.to || "", departureDate: initial.departure || "",
    returnDate: initial.returnDate || "", travellers: initial.passengers || 1,
    name: "", email: "", phone: "", notes: initial.packageSlug ? `Enquiry about package: ${initial.packageSlug}` : "", website: "",
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm(p => ({ ...p, [key]: value }));
  function changeService(s: Service) { setService(s); setStep(1); setError(""); }
  function journeyValid() {
    if (service === "flight") {
      if (!/^[A-Z]{3}$/.test(form.origin) || !/^[A-Z]{3}$/.test(form.destination)) return "Choose valid airports from the suggestions.";
      if (form.origin === form.destination) return "Departure and arrival airports must differ.";
      if (!form.departureDate || form.departureDate < dateToday()) return "Choose a departure date today or later.";
      if (trip === "return" && (!form.returnDate || form.returnDate < form.departureDate)) return "Choose a return date on or after departure.";
    } else if (form.notes.trim().length < 6) return "Tell us a little about your travel requirements.";
    return "";
  }
  function next(event: FormEvent) { event.preventDefault(); const message = journeyValid(); setError(message); if (!message) setStep(2); }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const message = journeyValid(); if (message) { setStep(1); setError(message); return; }
    if (!consent) { setError("Please agree to the privacy notice before submitting."); return; }
    setError(""); setBusy(true);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service, returnDate: trip === "return" && service === "flight" ? form.returnDate : "", consent }),
      });
      const data: { ok?: boolean; reference?: string; error?: string } = await response.json();
      if (!response.ok || !data.ok || !data.reference) { setError(data.error || "Could not submit. Please retry."); return; }
      router.push(`/thanks?ref=${encodeURIComponent(data.reference)}`);
    } catch { setError("The enquiry service could not be reached. Please contact our team directly."); }
    finally { setBusy(false); }
  }
  return <section className={embedded ? "container-wide" : "w-full"} aria-label="Travel enquiry">
    <div className="surface-card soft-shadow overflow-visible">
      <div className="flex flex-wrap overflow-hidden rounded-t-[20px] border-b border-[#e7edf5] bg-[#f8faff] sm:flex-nowrap" role="tablist" aria-label="Travel service">
        {tabs.map(t => <button key={t.key} role="tab" type="button" aria-selected={service === t.key} onClick={() => changeService(t.key)} className={`flex min-h-[60px] flex-1 items-center justify-center gap-2 border-b-[3px] px-3 text-[11px] font-medium sm:text-[13px] ${service === t.key ? "border-sapphire bg-white text-sapphire" : "border-transparent text-muted hover:bg-white"}`}><t.icon size={16}/>{t.label}</button>)}
      </div>
      <form onSubmit={step === 1 ? next : submit} className="p-5 sm:p-8 lg:p-9">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div><p className="eyebrow">Step {step} of 2</p><h2 className="mt-2 text-xl font-medium tracking-[-.035em] text-navy sm:text-2xl">{step === 1 ? "Where can we take you?" : "How can we reach you?"}</h2></div>
          <div className="flex gap-1.5" aria-hidden="true"><span className="h-1.5 w-9 rounded-full bg-sapphire"/><span className={`h-1.5 w-9 rounded-full ${step === 2 ? "bg-sapphire" : "bg-[#d8e3f2]"}`}/></div>
        </div>
        {step === 1 ? <>
          {service === "flight" ? <>
            <fieldset className="mb-5 flex flex-wrap gap-6 text-sm text-[#41536e]"><legend className="sr-only">Journey type</legend>
              <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="trip" checked={trip === "return"} onChange={() => setTrip("return")}/>Return</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="trip" checked={trip === "one-way"} onChange={() => { setTrip("one-way"); update("returnDate", ""); }}/>One way</label>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AirportCombobox id={embedded ? "home-origin" : "request-origin"} label="Flying from" value={form.origin} onChange={v => update("origin", v)}/>
              <AirportCombobox id={embedded ? "home-destination" : "request-destination"} label="Flying to" value={form.destination} onChange={v => update("destination", v)}/>
              <div><label htmlFor="travel-departure" className="label-field">Departure</label><input id="travel-departure" type="date" required min={dateToday()} className="input-field" value={form.departureDate} onChange={e => update("departureDate", e.target.value)}/></div>
              <div><label htmlFor="travel-return" className="label-field">Return {trip === "one-way" ? "(not required)" : ""}</label><input id="travel-return" type="date" min={form.departureDate || dateToday()} required={trip === "return"} disabled={trip === "one-way"} className="input-field disabled:bg-slate-100" value={form.returnDate} onChange={e => update("returnDate", e.target.value)}/></div>
            </div>
            <div className="mt-4 w-full sm:max-w-[210px]"><label htmlFor="travel-passengers" className="label-field">Travellers</label><select id="travel-passengers" className="input-field" value={form.travellers} onChange={e => update("travellers", Number(e.target.value))}>{Array.from({ length: 20 }, (_, i) => i + 1).map(n => <option value={n} key={n}>{n}</option>)}</select></div>
          </> : <div className="max-w-3xl"><label className="label-field" htmlFor="travel-description">Tell us about the {service === "visa" ? "visa" : service === "corporate" ? "group travel" : "holiday"} you are planning</label>
            <textarea id="travel-description" required minLength={6} maxLength={3000} value={form.notes} onChange={e => update("notes", e.target.value)} className="input-field min-h-[120px] resize-y py-3" placeholder="Destination, purpose, dates, traveller count and any special requirements"/></div>}
          <p className="mt-5 text-xs leading-6 text-muted">This is a travel enquiry, not a confirmed booking. No live fares are displayed.</p>
        </> : <div className="grid gap-5 sm:grid-cols-2">
          <div><label className="label-field" htmlFor="customer-name">Full name</label><input id="customer-name" required minLength={2} maxLength={100} autoComplete="name" className="input-field" value={form.name} onChange={e => update("name", e.target.value)}/></div>
          <div><label className="label-field" htmlFor="customer-email">Email address</label><input id="customer-email" type="email" required maxLength={200} autoComplete="email" className="input-field" value={form.email} onChange={e => update("email", e.target.value)}/></div>
          <div className="sm:col-span-2"><label className="label-field" htmlFor="customer-phone">Telephone / WhatsApp</label><input id="customer-phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="+234 ..." className="input-field" value={form.phone} onChange={e => update("phone", e.target.value)}/></div>
          <div className="sm:col-span-2"><label className="label-field" htmlFor="customer-notes">Additional details (optional)</label><textarea id="customer-notes" maxLength={3000} className="input-field min-h-[105px] resize-y py-3" value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Preferred airline, budget, accessibility needs, special notes..."/></div>
          <div className="sr-only" aria-hidden="true"><label htmlFor="enquiry-website">Website</label><input id="enquiry-website" value={form.website} onChange={e => update("website", e.target.value)} tabIndex={-1} autoComplete="off"/></div>
          <label className="sm:col-span-2 flex items-start gap-3 text-xs leading-6 text-muted"><input required type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1"/><span>I agree to Sapphire Quest processing these details to respond to my request, as described in the <a href="/privacy" target="_blank" className="font-semibold text-sapphire underline">privacy policy</a>.</span></label>
        </div>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9edf5] pt-5">
          {step === 2 ? <button type="button" disabled={busy} onClick={() => { setStep(1); setError(""); }} className="inline-flex items-center gap-2 text-sm font-medium text-muted"><ArrowLeft size={16}/> Back to journey</button> : <p className="flex items-center gap-2 text-xs text-muted"><CheckCircle2 size={15} className="text-sapphire"/> Personal assistance from our travel team</p>}
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">{busy ? <><Loader2 size={16} className="animate-spin"/> Sending...</> : step === 1 ? <>Next: personal details <ArrowRight size={16}/></> : <>Submit enquiry <ArrowRight size={16}/></>}</Button>
        </div>
      </form>
    </div>
  </section>;
}
