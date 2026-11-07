"use client";
import { useState } from "react";
import { PackageFields } from "@/features/admin/components/package-fields";
import type { PackageRecord } from "@/server/package-schema";
export function PackageEditor({data}:{data:PackageRecord}){
 const [open,setOpen]=useState(false);
 return <div className="border-b border-[#eef1f5] py-5"><div className="flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><p className="font-semibold text-navy">{data.title}</p><p className="mt-1 text-xs text-muted">{data.destination} · <span className="capitalize">{data.status}</span></p><p className="mt-1 text-[11px] text-muted">/{data.slug}</p></div><button type="button" aria-expanded={open} onClick={()=>setOpen(!open)} className="rounded-full border border-[#d9e4f4] px-4 py-2 text-xs font-semibold text-sapphire">{open?"Close editor":"Edit package"}</button></div>{open&&<div className="mt-6 rounded-2xl bg-[#f8faff] p-5 sm:p-7"><PackageFields id={data.id} initial={{title:data.title,slug:data.slug,summary:data.summary,destination:data.destination,status:data.status,highlights:data.highlights,priceAmount:data.priceAmount,currency:data.currency,discountPercent:data.discountPercent,features:data.features,images:data.images,details:data.details}} onSaved={()=>setOpen(false)}/></div>}</div>
}
