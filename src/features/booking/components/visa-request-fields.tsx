"use client";

import { useEffect, useRef, useState } from "react";
import { countries } from "@/data/countries";
import { visaTypes, visaPurposes } from "@/data/visa-options";
import { MapPin, LoaderCircle } from "lucide-react";

export type VisaSelection = { countryCode:string; city:string; visaType:string; travelPurpose:string; intendedDate:string; travellers:number };
export const blankVisa = ():VisaSelection=>({
  countryCode:"",city:"",visaType:"visitor",travelPurpose:"tourism",intendedDate:"",travellers:1,
});

type City = {id:number;name:string;region?:string};
export function CityField({country,city,onChange,id,label="Destination city"}:{country:string;city:string;onChange:(v:string)=>void;id:string;label?:string}){
  const [results,setResults]=useState<City[]>([]);
  const [loading,setLoading]=useState(false);
  const [unavailable,setUnavailable]=useState(false);
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!country || city.trim().length<2)return;
    const controller=new AbortController();
    const timeout=setTimeout(async()=>{
      setLoading(true);
      try{
        const response=await fetch("/api/visa/cities?"+new URLSearchParams({country,q:city}),{signal:controller.signal});
        if(!response.ok) throw new Error("City service unavailable");
        const data=await response.json() as {results:City[];unavailable?:boolean};
        if(!controller.signal.aborted){setResults(data.results||[]);setUnavailable(Boolean(data.unavailable));}
      }catch{
        if(!controller.signal.aborted){setResults([]);setUnavailable(true);}
      }finally{if(!controller.signal.aborted)setLoading(false);}
    },500);
    return ()=>{clearTimeout(timeout);controller.abort();};
  },[country,city]);
  useEffect(()=>{
    const onDown=(e:MouseEvent)=>{if(root.current&&!root.current.contains(e.target as Node))setOpen(false);};
    const onEsc=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false);};
    document.addEventListener("mousedown",onDown);document.addEventListener("keydown",onEsc);
    return()=>{document.removeEventListener("mousedown",onDown);document.removeEventListener("keydown",onEsc);};
  },[]);
  return <div ref={root} className="relative min-w-0">
    <label htmlFor={id} className="booking-label">{label}</label>
    <div className="relative">
      <MapPin aria-hidden size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sapphire"/>
      <input id={id} className="booking-input booking-location" required minLength={2} maxLength={100}
        disabled={!country} placeholder={country?"Search city (not airport)":"Choose country first"}
        value={city} autoComplete="off" onFocus={()=>setOpen(true)}
        onChange={e=>{onChange(e.target.value);setOpen(true);}}/>
      {loading&&city.trim().length>=2&&<LoaderCircle aria-label="Searching cities" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-sapphire" size={16}/>}
    </div>
    {open&&country&&city.trim().length>=2&&results.length>0&&<div className="absolute z-[110] mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[#d9e5f2] bg-white p-1 shadow-xl" role="listbox" aria-label="Cities in selected country">
      {results.map(item=><button type="button" key={item.id} role="option" aria-selected={city===item.name}
        onMouseDown={e=>e.preventDefault()} onClick={()=>{onChange(item.name);setOpen(false);}}
        className="block w-full rounded-lg px-3 py-2 text-left text-[13px] hover:bg-[#eef5ff]">
        <span className="block text-navy">{item.name}</span>
        {item.region&&<span className="block text-[11px] text-muted">{item.region}</span>}
      </button>)}
    </div>}
    {unavailable&&city.trim().length>=2&&<p className="mt-1.5 text-[11px] leading-5 text-muted">City suggestions are temporarily unavailable. Enter the city name manually; our team will confirm it.</p>}
  </div>;
}
export function VisaRequestFields({value,onChange,idPrefix,minDate}:{
  value:VisaSelection;onChange:(v:VisaSelection)=>void;idPrefix:string;minDate:string;
}){
  const set=<K extends keyof VisaSelection>(key:K,val:VisaSelection[K])=>onChange({...value,[key]:val});
  return <div className="space-y-4">
    <div className="rounded-xl bg-[#f0f6ff] px-4 py-3 text-[12px] leading-6 text-[#385071]">
      Tell us where and why you plan to travel. We&apos;ll advise you on the appropriate visa process for your destination.
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="min-w-0">
        <label htmlFor={idPrefix+"-visa-country"} className="booking-label">Destination country</label>
        <select required id={idPrefix+"-visa-country"} className="booking-input" value={value.countryCode}
          onChange={e=>onChange({...value,countryCode:e.target.value,city:""})}>
          <option value="">Select a country</option>
          {countries.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </div>
      <CityField key={value.countryCode||"none"} id={idPrefix+"-visa-city"} country={value.countryCode} city={value.city} onChange={v=>set("city",v)}/>
      <div>
        <label className="booking-label" htmlFor={idPrefix+"-visa-type"}>Visa type</label>
        <select className="booking-input" id={idPrefix+"-visa-type"} value={value.visaType} onChange={e=>set("visaType",e.target.value)}>
          {visaTypes.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
      </div>
      <div>
        <label className="booking-label" htmlFor={idPrefix+"-visa-purpose"}>Travel purpose</label>
        <select className="booking-input" id={idPrefix+"-visa-purpose"} value={value.travelPurpose} onChange={e=>set("travelPurpose",e.target.value)}>
          {visaPurposes.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}
        </select>
      </div>
      <div>
        <label className="booking-label" htmlFor={idPrefix+"-visa-date"}>Intended travel date</label>
        <input id={idPrefix+"-visa-date"} type="date" min={minDate} required className="booking-input" value={value.intendedDate} onChange={e=>set("intendedDate",e.target.value)}/>
      </div>
      <div>
        <label className="booking-label" htmlFor={idPrefix+"-visa-travellers"}>Travellers</label>
        <select id={idPrefix+"-visa-travellers"} className="booking-input" value={value.travellers} onChange={e=>set("travellers",Number(e.target.value))}>
          {Array.from({length:30},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} {n===1?"traveller":"travellers"}</option>)}
        </select>
      </div>
    </div>
    <p className="text-[11px] leading-5 text-muted">
      Visa categories and eligibility vary by country. This request begins an assessment and does not guarantee a visa.
    </p>
  </div>;
}
