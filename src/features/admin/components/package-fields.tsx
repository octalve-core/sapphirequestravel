"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Save } from "lucide-react";
import { PackageMedia } from "@/features/admin/components/package-media";
import { RichTextEditor } from "@/features/packages/components/rich-text-editor";
import { emptyPackage, type PackageInput } from "@/server/package-schema";
import { Button } from "@/components/ui/button";
export function slugify(value:string){return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,130)}
export function PackageFields({initial,id,onSaved}:{initial?:PackageInput;id?:string;onSaved?:()=>void}){
 const router=useRouter();const [form,setForm]=useState<PackageInput>(initial||emptyPackage());const [slugEdited,setSlugEdited]=useState(Boolean(id));
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");const [editorReset,setEditorReset]=useState(0);
 const update=<K extends keyof PackageInput>(k:K,value:PackageInput[K])=>setForm(p=>({...p,[k]:value}));
 async function save(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{
  const r=await fetch(id?`/api/admin/packages/${id}`:"/api/admin/packages",{method:id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
  const data:{error?:string,ok?:boolean}=await r.json();if(!r.ok||!data.ok){setMessage(data.error||"Unable to save. Check the fields and database migration.");return}
  setMessage(id?"Package updated":"Draft package created");if(!id){setForm(emptyPackage());setSlugEdited(false);setEditorReset(x=>x+1)}onSaved?.();router.refresh();
 }catch{setMessage("Network error. Check your connection.")}finally{setBusy(false)}}
 return <form onSubmit={save} className="space-y-6">
  <div className="grid gap-4 sm:grid-cols-2">
   <div className="sm:col-span-2"><label htmlFor={`${id||"new"}-title`} className="label-field">Package title</label><input id={`${id||"new"}-title`} required maxLength={120} minLength={4} className="input-field" value={form.title} onChange={e=>{const title=e.target.value;setForm(p=>({...p,title,slug:slugEdited?p.slug:slugify(title)}))}} placeholder="e.g. Explore Singapore"/></div>
   <div className="sm:col-span-2"><label htmlFor={`${id||"new"}-slug`} className="label-field">Website slug — suggested, but editable</label><input id={`${id||"new"}-slug`} required maxLength={130} pattern="[a-z0-9]+(-[a-z0-9]+)*" className="input-field" value={form.slug} onChange={e=>{setSlugEdited(true);update("slug",slugify(e.target.value))}}/></div>
   <div><label className="label-field">Destination</label><input required minLength={2} maxLength={100} className="input-field" value={form.destination} onChange={e=>update("destination",e.target.value)}/></div>
   <div><label className="label-field">Visibility</label><select value={form.status} onChange={e=>update("status",e.target.value as PackageInput["status"])} className="input-field"><option value="draft">Draft — staff only</option><option value="published">Published — public</option></select></div>
   <div className="sm:col-span-2"><label className="label-field">Short summary (shown on cards)</label><textarea maxLength={750} className="input-field min-h-[90px] py-3" value={form.summary} onChange={e=>update("summary",e.target.value)} placeholder="A clear, short overview of what the package offers"/></div>
   <div className="sm:col-span-2"><label className="label-field">Feature highlight / short introduction</label><input maxLength={320} className="input-field" value={form.highlights} onChange={e=>update("highlights",e.target.value)} placeholder="e.g. Flights and accommodation arranged around your preferences"/></div>
  </div>
  <div className="grid gap-4 sm:grid-cols-3">
   <div><label className="label-field">Advertised price (optional)</label><input type="number" min={0} step="0.01" className="input-field" placeholder="No price yet" value={form.priceAmount??""} onChange={e=>update("priceAmount",e.target.value===""?null:Number(e.target.value))}/></div>
   <div><label className="label-field">Currency</label><select className="input-field" value={form.currency} onChange={e=>update("currency",e.target.value as PackageInput["currency"])}>{["NGN","USD","GBP","EUR"].map(c=><option key={c} value={c}>{c}</option>)}</select></div>
   <div><label className="label-field">Discount (%)</label><input type="number" min={0} max={90} step={1} className="input-field" value={form.discountPercent} onChange={e=>update("discountPercent",Number(e.target.value))}/></div>
  </div>
  <p className="-mt-4 text-[11px] leading-5 text-muted">Only prices approved by the travel team should be published. Discounts are indicative until a customer receives a confirmed quote.</p>
  <div><label className="label-field">Included features — one item per line</label><textarea className="input-field min-h-[130px] py-3" placeholder={"e.g. Flight coordination\nAccommodation guidance\nAirport transfers"} value={form.features.join("\n")} onChange={e=>update("features",e.target.value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,20))}/></div>
  <div><label className="label-field">Full package description</label><RichTextEditor key={editorReset} value={form.details} onChange={v=>update("details",v)}/></div>
  <div><label className="label-field">Package photos</label><PackageMedia images={form.images} onChange={v=>update("images",v)}/></div>
  {message&&<p role="status" className={`rounded-xl px-4 py-3 text-xs ${/error|unable|failed|check/i.test(message)?"bg-red-50 text-red-700":"bg-green-50 text-green-800"}`}>{message}</p>}
  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-muted">Saving does not book a flight or charge a customer.</p><Button disabled={busy} type="submit">{busy?"Saving...":<><Save size={16}/> {id?"Save package changes":"Create package"} <ArrowUpRight size={15}/></>}</Button></div>
 </form>;
}
