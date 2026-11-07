"use client";
import { useEffect, useId, useRef, useState } from "react";
import { PlaneTakeoff } from "lucide-react";
import type { AirportSuggestion, AirportResults } from "@/server/airport-types";
import { airports } from "@/data/airports";

type Props = { label: string; value: string; onChange: (code: string) => void; id?: string };

/** Accessible keyboard-friendly airport picker; never claims curated results are live IATA inventory. */
export function AirportCombobox({ label, value, onChange, id }: Props) {
  const uniqueId = useId();
  const inputId = id || uniqueId;
  const initial = airports.find(a => a.code === value);
  const [search, setSearch] = useState(initial ? `${initial.city} (${initial.code})` : value);
  const [options, setOptions] = useState<AirportSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [source, setSource] = useState<AirportResults["source"]>("curated");
  const [live, setLive] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const query = search.match(/\(([A-Z]{3})\)$/)?.[1] || search;
    const timer = setTimeout(() => {
      fetch(`/api/airports?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(async r => { if (!r.ok) throw new Error("Airport lookup unavailable"); return r.json() as Promise<AirportResults>; })
        .then(x => {
          if (controller.signal.aborted) return;
          setOptions(x.results || []);
          setActive(0);
          setSource(x.source);
          setLive(x.live);
        })
        .catch(() => { if (!controller.signal.aborted) { setOptions([]); setActive(0); } });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, open]);

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function pick(airport: AirportSuggestion) {
    onChange(airport.code);
    setSearch(`${airport.city} (${airport.code})`);
    setOpen(false);
  }

  return <div className="relative" ref={root}>
    <label htmlFor={inputId} className="label-field">{label}</label>
    <div className="relative">
      <PlaneTakeoff aria-hidden size={16} className="pointer-events-none absolute left-3 top-[18px] text-[#8190a5]"/>
      <input
        id={inputId} role="combobox" aria-autocomplete="list" aria-expanded={open}
        aria-controls={`${inputId}-list`} aria-activedescendant={open && options.length ? `${inputId}-option-${active}` : undefined}
        aria-required="true" required value={search} placeholder="Search city or airport"
        autoComplete="off" className="input-field pl-10"
        onFocus={() => setOpen(true)}
        onChange={e => { setSearch(e.target.value); onChange(""); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === "Escape") { setOpen(false); return; }
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(i => Math.min(i + 1, Math.max(0, options.length - 1))); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
          if (e.key === "Enter" && open && options[active]) { e.preventDefault(); pick(options[active]); }
        }}
      />
    </div>
    <input type="hidden" name={`${inputId}-code`} value={value}/>
    {open && <div id={`${inputId}-list`} role="listbox" className="absolute z-[80] mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[#e5ebf5] bg-white p-2 shadow-2xl">
      {options.length ? options.map((airport, index) => <button
        type="button" id={`${inputId}-option-${index}`} role="option"
        aria-selected={value === airport.code} key={airport.code}
        onMouseDown={e => e.preventDefault()}
        onMouseEnter={() => setActive(index)} onClick={() => pick(airport)}
        className={`flex w-full items-center justify-between gap-4 rounded-lg p-3 text-left hover:bg-[#edf4ff] focus:bg-[#edf4ff] ${active === index ? "bg-[#edf4ff]" : ""}`}>
        <span className="min-w-0 text-sm font-medium text-navy">{airport.city}<span className="block truncate text-xs font-normal text-muted">{airport.name && airport.name !== airport.city ? `${airport.name} · ` : ""}{airport.country}</span></span>
        <span className="shrink-0 rounded-md bg-[#eef4ff] px-2 py-1 text-xs font-bold text-sapphire">{airport.code}</span>
      </button>) : <p className="px-3 py-4 text-xs text-muted">No matching airports. Try another city or IATA code.</p>}
      <p className="border-t border-[#e9edf5] px-3 pt-2 text-[10px] text-muted">{source === "amadeus" ? (live ? "Airport results from Amadeus" : "Amadeus test data — not complete") : "Common airports only — live search requires provider access"}</p>
    </div>}
  </div>;
}
