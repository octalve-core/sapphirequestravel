"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, Eye, MapPin, Minus, Plus, X } from "lucide-react";

export type TourSelection = {
  slug:string;startDate:string;departureCity:string;adults:number;children:number;infants:number;
};
export const blankTour=(slug=""):TourSelection=>({
  slug,startDate:"",departureCity:"Lagos",adults:2,children:0,infants:0,
});
export type TourOption={
  slug:string;title:string;destination:string;summary:string;highlights:string;
  features:string[];image:string;price:number|null;currency:string;
};
export function TourRequestFields({value,onChange,idPrefix,minDate,options,loading,error}:{
  value:TourSelection;onChange:(v:TourSelection)=>void;idPrefix:string;minDate:string;
  options:TourOption[];loading:boolean;error:string;
}){
  const selected=options.find(x=>x.slug===value.slug);
  const dialog=useRef<HTMLDialogElement>(null);
  const [open,setOpen]=useState(false);
  const set=<K extends keyof TourSelection>(key:K,v:TourSelection[K])=>onChange({...value,[key]:v});
  useEffect(()=>{
    const el=dialog.current;
    if(!el)return;
    if(open&&!el.open)el.showModal();
    if(!open&&el.open)el.close();
  },[open]);
  const total=value.adults+value.children+value.infants;
  function updateCount(key:"adults"|"children"|"infants",delta:number){
    const next={...value,[key]:value[key]+delta};
    if(next.adults<1||next.children<0||next.infants<0||next.infants>next.adults||
       next.adults>20||next.children>20||next.infants>20||
       next.adults+next.children+next.infants>30)return;
    onChange(next);
  }
  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-2">
      <div className="min-w-0 md:col-span-2">
        <label className="booking-label" htmlFor={idPrefix+"-tour-package"}>Choose your tour package</label>
        <select id={idPrefix+"-tour-package"} required disabled={loading||!!error} className="booking-input"
          value={value.slug} onChange={e=>set("slug",e.target.value)}>
          <option value="">{loading?"Loading available packages...":"Select a published package"}</option>
          {options.map(x=><option key={x.slug} value={x.slug}>{x.title} — {x.destination}</option>)}
        </select>
        {error&&<p role="alert" className="mt-2 text-[11px] text-red-700">{error}</p>}
      </div>
      {selected&&<div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d8e6f8] bg-white p-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-navy">{selected.title}</p>
          <p className="mt-1 flex items-center gap-2 text-[11px] text-muted"><MapPin size={13} className="shrink-0" aria-hidden/><span>{selected.destination} · {selected.highlights.split("·")[0]}</span></p>
          {selected.price!=null&&<p className="mt-1 text-[12px] font-medium text-sapphire">From {new Intl.NumberFormat("en-NG",{style:"currency",currency:selected.currency,maximumFractionDigits:0}).format(selected.price)} per adult sharing</p>}
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full border border-sapphire px-4 py-2.5 text-[12px] font-medium text-sapphire"
          onClick={()=>setOpen(true)}><Eye size={15} aria-hidden/> View details</button>
      </div>}
      <div>
        <label className="booking-label" htmlFor={idPrefix+"-tour-date"}>Preferred travel date</label>
        <input id={idPrefix+"-tour-date"} type="date" min={minDate} required className="booking-input" value={value.startDate} onChange={e=>set("startDate",e.target.value)}/>
      </div>
      <div>
        <label className="booking-label" htmlFor={idPrefix+"-tour-city"}>Departing from</label>
        <select id={idPrefix+"-tour-city"} className="booking-input" value={value.departureCity} onChange={e=>set("departureCity",e.target.value)}>
          {["Lagos","Abuja","Port Harcourt","Kano","Other Nigerian city"].map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
    <fieldset className="rounded-xl border border-[#e0e8f4] p-4">
      <legend className="px-1 text-[12px] font-medium text-navy">Travellers ({total})</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {([
          ["adults","Adults","12+"],["children","Children","2–11"],["infants","Infants","Under 2"],
        ] as const).map(([key,label,age])=><div key={key} className="flex items-center justify-between gap-2">
          <div><p className="text-[12px] font-medium">{label}</p><p className="text-[10px] text-muted">{age}</p></div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label={"Remove "+label} className="grid size-8 place-items-center rounded-lg border border-[#d7e4f2]" onClick={()=>updateCount(key,-1)}><Minus size={12}/></button>
            <span className="w-5 text-center text-[12px] tabular-nums">{value[key]}</span>
            <button type="button" aria-label={"Add "+label} className="grid size-8 place-items-center rounded-lg border border-[#d7e4f2]" onClick={()=>updateCount(key,1)}><Plus size={12}/></button>
          </div>
        </div>)}
      </div>
    </fieldset>
    <p className="text-[11px] leading-5 text-muted">Package arrangements are subject to your selected travel dates. Our adviser will confirm the full trip total before payment.</p>
    <dialog ref={dialog} onClose={()=>setOpen(false)} aria-labelledby={idPrefix+"-tour-preview-title"}
      className="fixed inset-x-0 bottom-0 top-auto mx-0 mb-0 ml-auto mr-auto w-full max-w-[700px] max-h-[90dvh] overflow-y-auto rounded-t-[24px] border-0 bg-white p-0 text-navy shadow-2xl backdrop:bg-[#061328]/65 sm:inset-0 sm:m-auto sm:max-h-[86dvh] sm:rounded-3xl">
      {selected&&<div>
        <div className="relative aspect-[16/8] bg-[#e5eff9]">
          <Image src={selected.image} fill unoptimized={selected.image.startsWith("https://")} sizes="(max-width:640px) 100vw, 700px" className="object-cover" alt={selected.title}/>
          <button type="button" onClick={()=>setOpen(false)} aria-label="Close preview" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white text-navy shadow-lg"><X size={19}/></button>
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          <p className="eyebrow">Experience preview</p>
          <h2 id={idPrefix+"-tour-preview-title"} className="text-[25px] font-medium leading-tight tracking-[-.035em] text-navy">{selected.title}</h2>
          <p className="text-[13px] leading-7 text-muted">{selected.summary}</p>
          <p className="flex items-center gap-2 text-[12px] text-sapphire"><CalendarDays size={15}/>{selected.highlights}</p>
          {selected.features.length>0&&<div><h3 className="mb-3 text-[14px] font-medium text-navy">What&apos;s included</h3>
            <ul className="space-y-2 text-[12px] leading-6 text-[#485b78]">{selected.features.slice(0,5).map(s=><li key={s}>✓ {s}</li>)}</ul>
          </div>}
          <div className="flex flex-wrap gap-3 border-t border-[#edf1f6] pt-5">
            <button type="button" className="rounded-full bg-sapphire px-5 py-3 text-[12px] font-medium text-white" onClick={()=>setOpen(false)}>Continue with this tour</button>
            <Link href={"/packages/"+selected.slug} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#d6e1ef] px-5 py-3 text-[12px] font-medium text-sapphire">Full package page <ArrowUpRight size={14}/></Link>
          </div>
        </div>
      </div>}
    </dialog>
  </div>;
}
