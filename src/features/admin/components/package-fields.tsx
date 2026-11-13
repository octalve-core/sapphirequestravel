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
 type HomeKey = keyof NonNullable<PackageInput["details"]["home"]>;
 function updateHome<K extends HomeKey>(key:K,value:NonNullable<PackageInput["details"]["home"]>[K]) {
   setForm(p=>({...p,details:{...p.details,home:{
     enabled:false,position:100,title:"",label:"",image:"",
     ...p.details.home,[key]:value,
   }}}));
 }

 async function save(e:FormEvent){e.preventDefault();setBusy(true);setMessage("");try{
  const r=await fetch(id?`/api/admin/packages/${id}`:"/api/admin/packages",{method:id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
  const data:{error?:string,ok?:boolean}=await r.json();if(!r.ok||!data.ok){setMessage(data.error||"Unable to save. Check the fields and database migration.");return}
  setMessage(id?"Package updated":"Package created");if(!id){setForm(emptyPackage());setSlugEdited(false);setEditorReset(x=>x+1);router.push("/admin/packages");}onSaved?.();router.refresh();
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
  <p className="-mt-4 text-[11px] leading-5 text-muted">Published prices should reflect a genuine supplier-based starting offer. Final traveller arrangements are confirmed before payment.</p>
  <fieldset className="rounded-2xl border border-[#dde6f1] bg-[#f8faff] p-5">
    <legend className="px-2 text-sm font-medium text-navy">Guest ratings — verified feedback only</legend>
    <p className="mb-4 text-xs leading-6 text-muted">Show a star rating only after receiving genuine, documented customer reviews. Leave blank for new packages. Rating and review count are editable here.</p>
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="text-xs text-navy">Average stars (1–5)
        <input aria-label="Average guest rating" type="number" step="0.1" min="1" max="5" className="input-field mt-2" placeholder="Not yet rated" value={form.ratingScore??""} onChange={e=>update("ratingScore",e.target.value===""?null:Number(e.target.value))}/>
      </label>
      <label className="text-xs text-navy">Verified review count
        <input type="number" min="0" max="1000000" step="1" className="input-field mt-2" value={form.ratingCount} onChange={e=>update("ratingCount",Number(e.target.value))}/>
      </label>
      <label className="text-xs text-navy">Evidence / feedback source
        <input maxLength={250} className="input-field mt-2" value={form.ratingSource} onChange={e=>update("ratingSource",e.target.value)} placeholder="e.g. dated post-trip customer surveys"/>
      </label>
    </div>
  </fieldset>
  <fieldset className="rounded-2xl border border-[#d8e5f4] bg-[#f7faff] p-5 sm:p-6">
    <legend className="px-2 text-sm font-medium text-navy">Homepage feature · Explore the possibilities</legend>
    <p className="mb-5 text-xs leading-6 text-muted">
      This controls the original homepage image card, not the normal card on the Packages page.
      Up to four published packages are displayed, in the order you set here.
    </p>
    <label className="mb-5 flex items-center gap-3 text-sm font-medium text-navy">
      <input type="checkbox" checked={Boolean(form.details.home?.enabled)}
        onChange={e=>updateHome("enabled",e.target.checked)} />
      Show this package on the homepage
    </label>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-medium text-navy">
        Homepage card title
        <input className="input-field mt-2" maxLength={80}
          value={form.details.home?.title||""}
          onChange={e=>updateHome("title",e.target.value)}
          placeholder="e.g. Coastal escapes" />
      </label>
      <label className="text-xs font-medium text-navy">
        Location / caption
        <input className="input-field mt-2" maxLength={90}
          value={form.details.home?.label||""}
          onChange={e=>updateHome("label",e.target.value)}
          placeholder="e.g. Zanzibar, Tanzania" />
      </label>
      <label className="text-xs font-medium text-navy">
        Display position (1–100)
        <input type="number" min={1} max={100} step={1} className="input-field mt-2"
          value={form.details.home?.position??100}
          onChange={e=>updateHome("position",Number(e.target.value))}/>
      </label>
      <label className="text-xs font-medium text-navy">
        Original card image URL
        <input className="input-field mt-2" maxLength={600}
          value={form.details.home?.image||""}
          onChange={e=>updateHome("image",e.target.value)}
          placeholder="/images/singapore.webp"/>
      </label>
    </div>
    <p className="mt-4 text-[11px] leading-6 text-muted">
      Your current homepage picture stays in place. To replace it, upload a new image
      in Package photos below and place it first in the gallery. That image will automatically
      become the homepage cover and standard package card image. The original file is preserved.
    </p>
  </fieldset>
  <div><label className="label-field">Included features — one item per line</label><textarea className="input-field min-h-[130px] py-3" placeholder={"e.g. Flight coordination\nAccommodation guidance\nAirport transfers"} value={form.features.join("\n")} onChange={e=>update("features",e.target.value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,20))}/></div>
  <div><label className="label-field">Full package description</label><RichTextEditor key={editorReset} value={form.details} onChange={v=>setForm(p=>({...p,details:{...p.details,blocks:v.blocks}}))}/></div>
  <div><label className="label-field">Package photos</label><PackageMedia images={form.images} onChange={v=>update("images",v)}/></div>
  {message&&<p role="status" className={`rounded-xl px-4 py-3 text-xs ${/error|unable|failed|check/i.test(message)?"bg-red-50 text-red-700":"bg-green-50 text-green-800"}`}>{message}</p>}
  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-[11px] text-muted">Saving does not book a flight or charge a customer.</p><Button disabled={busy} type="submit">{busy?"Saving...":<><Save size={16}/> {id?"Save package changes":"Create package"} <ArrowUpRight size={15}/></>}</Button></div>
 </form>;
}
