"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, CheckCircle2, LoaderCircle, Minus, Plus } from "lucide-react";
import Link from "next/link";

type Counters = { adults: number; children: number; infants: number };
const dateToday = () => new Date().toISOString().slice(0, 10);
const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export function PackageQuoteForm({
  packageSlug, packageTitle, startingPrice, currency, discount,
}: {
  packageSlug: string;
  packageTitle: string;
  startingPrice: number | null;
  currency: string;
  discount: number;
}) {
  const [date, setDate] = useState("");
  const [departureCity, setDepartureCity] = useState("Lagos");
  const [travel, setTravel] = useState<Counters>({ adults: 2, children: 0, infants: 0 });
  const [contact, setContact] = useState({ name: "", email: "", phone: "", notes: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  function setCount(key: keyof Counters, delta: number) {
    setTravel((prev) => {
      const next = { ...prev, [key]: prev[key] + delta };
      const total = next.adults + next.children + next.infants;
      if (next.adults < 1 || next.children < 0 || next.infants < 0 ||
          total > 30 || next.adults > 20 || next.children > 20 || next.infants > 20 ||
          next.infants > next.adults) return prev;
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const payload = {
        preferredDate: date, departureCity,
        adults: travel.adults, children: travel.children, infants: travel.infants,
        ...contact, consent,
      };
      const response = await fetch("/api/packages/" + encodeURIComponent(packageSlug) + "/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { error?: string; reference?: string } = await response.json();
      if (!response.ok || !data.reference) {
        setError(data.error || "We couldn't send your request. Please try again.");
        return;
      }
      setReference(data.reference);
    } catch {
      setError("Connection interrupted. Please check your network and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (reference) return (
    <div role="status" className="py-8 text-center">
      <CheckCircle2 size={42} className="mx-auto text-[#16856b]" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-medium text-navy">We&apos;ve received your travel request.</h2>
      <p className="mt-3 text-sm leading-7 text-muted">
        Your Sapphire Quest adviser will review your preferred dates and travel details.
        You&apos;ll receive a personalised response.
      </p>
      <p className="mt-4 rounded-xl bg-[#f1f6ff] px-4 py-3 text-sm font-medium text-sapphire">
        Reference: {reference}
      </p>
    </div>
  );

  const nightly = startingPrice == null ? null : Math.round(startingPrice * (100 - discount) / 100);
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <p className="eyebrow">A journey of your own</p>
        <h2 className="mt-3 text-xl font-medium tracking-[-.035em] text-navy">Get a personal quote</h2>
        <p className="mt-2 text-[12px] leading-6 text-muted">Tell us when you&apos;d like to travel. We&apos;ll take care of the details.</p>
      </div>
      {nightly !== null && (
        <div className="rounded-xl bg-[#eef5ff] p-4">
          <p className="text-[11px] text-muted">Starting from · per adult sharing</p>
          <p className="mt-1 text-2xl font-medium tracking-[-.035em] text-navy">{money(nightly, currency)}</p>
        </div>
      )}
      <div>
        <label htmlFor="selected-package" className="label-field">Your experience</label>
        <input id="selected-package" className="input-field bg-[#f6f9fc] text-navy" readOnly value={packageTitle}/>
      </div>
      <div>
        <label htmlFor="package-date" className="label-field">Preferred departure date</label>
        <div className="relative">
          <CalendarDays size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sapphire"/>
          <input id="package-date" type="date" required min={dateToday()} className="input-field pl-10" value={date} onChange={e=>setDate(e.target.value)}/>
        </div>
      </div>
      <div>
        <label htmlFor="package-city" className="label-field">Departing from</label>
        <select id="package-city" className="input-field" value={departureCity} onChange={e=>setDepartureCity(e.target.value)}>
          <option value="Lagos">Lagos</option>
          <option value="Abuja">Abuja</option>
          <option value="Port Harcourt">Port Harcourt</option>
          <option value="Kano">Kano</option>
          <option value="Other Nigerian city">Other Nigerian city</option>
        </select>
      </div>
      <fieldset className="space-y-3 border-y border-[#e9edf4] py-5">
        <legend className="px-1 text-xs font-medium text-navy">Travellers</legend>
        {([
          ["adults", "Adults", "Ages 12+"],
          ["children", "Children", "Ages 2–11"],
          ["infants", "Infants", "Under 2"],
        ] as const).map(([key, label, sub]) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <div><p className="text-[12px] font-medium text-navy">{label}</p><p className="text-[10px] text-muted">{sub}</p></div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label={"Remove " + label.toLowerCase()} onClick={()=>setCount(key,-1)} className="grid size-8 place-items-center rounded-lg border border-[#d8e3f0] text-sapphire"><Minus size={13}/></button>
              <span className="min-w-6 text-center text-[12px] font-medium tabular-nums">{travel[key]}</span>
              <button type="button" aria-label={"Add " + label.toLowerCase()} onClick={()=>setCount(key,1)} className="grid size-8 place-items-center rounded-lg border border-[#d8e3f0] text-sapphire"><Plus size={13}/></button>
            </div>
          </div>
        ))}
      </fieldset>
      <div>
        <label htmlFor="package-name" className="label-field">Full name</label>
        <input id="package-name" required minLength={2} maxLength={100} autoComplete="name" className="input-field" value={contact.name} onChange={e=>setContact(p=>({...p,name:e.target.value}))}/>
      </div>
      <div>
        <label htmlFor="package-email" className="label-field">Email address</label>
        <input id="package-email" required type="email" autoComplete="email" maxLength={200} className="input-field" value={contact.email} onChange={e=>setContact(p=>({...p,email:e.target.value}))}/>
      </div>
      <div>
        <label htmlFor="package-phone" className="label-field">Phone / WhatsApp number</label>
        <input id="package-phone" required type="tel" autoComplete="tel" maxLength={30} className="input-field" value={contact.phone} onChange={e=>setContact(p=>({...p,phone:e.target.value}))}/>
      </div>
      <div>
        <label htmlFor="package-notes" className="label-field">Anything we should know? <span className="text-muted">(optional)</span></label>
        <textarea id="package-notes" rows={3} maxLength={2000} className="input-field resize-y py-3" value={contact.notes} onChange={e=>setContact(p=>({...p,notes:e.target.value}))} placeholder="Occasion, hotel preferences, special requests..."/>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="package-website">Website</label>
        <input id="package-website" tabIndex={-1} autoComplete="off" value={contact.website} onChange={e=>setContact(p=>({...p,website:e.target.value}))}/>
      </div>
      <label className="flex items-start gap-2.5 text-[11px] leading-5 text-muted">
        <input required type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-1"/>
        <span>I agree that Sapphire Quest may use these details to respond to my travel enquiry, as described in the <Link href="/privacy" className="text-sapphire underline">Privacy Policy</Link>.</span>
      </label>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sapphire px-5 text-[13px] font-medium text-white disabled:opacity-60">
        {busy && <LoaderCircle size={16} className="animate-spin" aria-hidden="true"/>}
        {busy ? "Sending your request..." : "Request my quote"}
      </button>
      <p className="text-center text-[11px] leading-5 text-muted">No payment is taken. A travel adviser will confirm availability and the complete trip total.</p>
    </form>
  );
}
