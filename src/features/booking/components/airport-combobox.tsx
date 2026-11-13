"use client";
import { useEffect, useId, useRef, useState } from "react";
import { MapPin, LoaderCircle } from "lucide-react";
import type { AirportSuggestion, AirportResults } from "@/server/airport-types";
import { airports } from "@/data/airports";

type Props = { label: string; value: string; onChange: (code: string) => void; id?: string; placeholder?: string; helper?: string; required?: boolean };

export function AirportCombobox({ label, value, onChange, id, placeholder = "Search city, airport or code", helper, required = true }: Props) {
  const key = useId();
  const inputId = id || key;
  const [search, setSearch] = useState(() => {
    const entry = airports.find(a => a.code === value);
    return entry ? `${entry.city} (${entry.code})` : value;
  });
  const [options, setOptions] = useState<AirportSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const query = search.match(/\(([A-Z]{3})\)$/)?.[1] || search;
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/airports?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(async r => { if (!r.ok) throw new Error("Lookup unavailable"); return r.json() as Promise<AirportResults>; })
        .then(x => { if (controller.signal.aborted) return; setOptions(x.results || []); setActive(0); })
        .catch(() => { if (!controller.signal.aborted) { setOptions([]); setActive(0); } })
        .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, open]);

  useEffect(() => {
    const outside = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function select(airport: AirportSuggestion) {
    onChange(airport.code);
    setSearch(`${airport.city} (${airport.code})`);
    setOpen(false);
  }

  return <div ref={root} className="relative min-w-0">
    <label htmlFor={inputId} className="booking-label">{label}</label>
    <div className="relative">
      <MapPin aria-hidden="true" size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sapphire"/>
      <input
        id={inputId} role="combobox" aria-autocomplete="list" aria-expanded={open}
        aria-controls={`${inputId}-results`} aria-activedescendant={open && options[active] ? `${inputId}-option-${active}` : undefined}
        aria-required={required} required={required} autoComplete="off" spellCheck={false}
        className="booking-input booking-airport"
        placeholder={placeholder} value={search}
        onFocus={() => setOpen(true)}
        onBlur={() => { if (!required && !value) setSearch(""); }}
        onChange={e => { setSearch(e.target.value); onChange(""); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === "Escape") { setOpen(false); return; }
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, Math.max(options.length - 1, 0))); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
          if (e.key === "Enter" && open && options[active]) { e.preventDefault(); select(options[active]); }
        }}
      />
      {loading && <LoaderCircle aria-label="Searching airports" size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-sapphire"/>}
    </div>
    {helper && <p className="mt-1.5 text-[11px] leading-4 text-muted">{helper}</p>}
    {open && <div id={`${inputId}-results`} role="listbox" className="absolute z-[100] mt-2 max-h-72 w-full min-w-0 overflow-y-auto rounded-2xl border border-[#e2e8f1] bg-white p-2 shadow-[0_20px_45px_-12px_rgba(6,26,54,.24)]">
      {options.length ? options.map((airport, index) => <button
        type="button" key={`${airport.code}-${index}`} id={`${inputId}-option-${index}`} role="option"
        aria-selected={value === airport.code} onMouseDown={e => e.preventDefault()}
        onMouseEnter={() => setActive(index)} onClick={() => select(airport)}
        className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#f0f5ff] ${active === index ? "bg-[#f0f5ff]" : ""}`}>
        <span className="min-w-0"><span className="block text-[13px] font-semibold text-navy">{airport.city}</span><span className="mt-0.5 block text-[11px] leading-4 text-muted">{airport.name ? `${airport.name} · ` : ""}{airport.country}</span></span>
        <span className="shrink-0 rounded-md bg-[#eaf2ff] px-2 py-1 text-[11px] font-bold text-sapphire">{airport.code}</span>
      </button>) : <p className="px-3 py-4 text-xs text-muted">{loading ? "Finding airports..." : "No matches yet. Try another city, airport or code."}</p>}

    </div>}
  </div>;
}
