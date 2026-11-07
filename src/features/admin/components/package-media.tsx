"use client";
import { useRef, useState } from "react";
import { ImagePlus, Link2, LoaderCircle, X } from "lucide-react";

type ImageKitAuth={token:string;expire:number;signature:string;publicKey:string;error?:string};
export function PackageMedia({images,onChange}:{images:string[];onChange:(images:string[])=>void}){
 const [url,setUrl]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const input=useRef<HTMLInputElement>(null);
 function addUrl(){setError("");if(images.length>=5){setError("A maximum of five images is allowed.");return}try{const u=new URL(url);if(!["http:","https:"].includes(u.protocol))throw Error();onChange([...images,url.trim()]);setUrl("")}catch{setError("Enter a valid https image URL.")}}
 async function upload(file:File){setError("");if(images.length>=5){setError("A maximum of five images is allowed.");return}if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024){setError("Use JPG, PNG or WEBP files under 5 MB.");return}
  setBusy(true);try{
   const r=await fetch("/api/admin/media/auth",{cache:"no-store"});const auth:ImageKitAuth=await r.json();if(!r.ok)throw new Error(auth.error || "Image authentication unavailable");
   const body=new FormData();body.append("file",file);body.append("fileName",file.name);body.append("publicKey",auth.publicKey);body.append("token",auth.token);body.append("expire",String(auth.expire));body.append("signature",auth.signature);body.append("folder","/sapphirequest/packages");body.append("useUniqueFileName","true");
   const response=await fetch("https://upload.imagekit.io/api/v1/files/upload",{method:"POST",body});
   const data:{url?:string;message?:string}=await response.json();if(!response.ok||!data.url)throw new Error(data.message||"Upload failed");onChange([...images,data.url]);
  }catch(e){setError(e instanceof Error?e.message:"Upload unavailable")}finally{setBusy(false);if(input.current)input.current.value=""}
 }
 return <div className="space-y-3"><div className="grid gap-3 sm:grid-cols-3">{images.map((src,i)=><div key={`${src}-${i}`} className="relative aspect-[5/3] overflow-hidden rounded-lg border bg-[#e9eff8]"><img src={src} alt={`Package image ${i+1}`} className="h-full w-full object-cover" referrerPolicy="no-referrer"/><button type="button" aria-label={`Remove image ${i+1}`} onClick={()=>onChange(images.filter((_,j)=>j!==i))} className="absolute right-2 top-2 rounded-full bg-white p-1.5 text-red-700"><X size={15}/></button></div>)}</div>
 <div className="flex flex-wrap gap-2"><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e=>e.target.files?.[0]&&void upload(e.target.files[0])}/><button type="button" disabled={busy||images.length>=5} onClick={()=>input.current?.click()} className="inline-flex items-center gap-2 rounded-lg border border-[#d6e0ed] px-3 py-2 text-xs font-semibold text-navy disabled:opacity-50">{busy?<LoaderCircle size={15} className="animate-spin"/>:<ImagePlus size={15}/>} Upload image</button><span className="self-center text-[11px] text-muted">Maximum five images, 5 MB each. Uploads require ImageKit credentials.</span></div>
 <div className="flex gap-2"><input aria-label="External image URL" value={url} onChange={e=>setUrl(e.target.value)} placeholder="Or paste an https:// image URL" className="input-field min-w-0 flex-1"/><button type="button" onClick={addUrl} disabled={images.length>=5} className="inline-flex items-center gap-1 rounded-lg bg-[#e9f1ff] px-4 text-xs font-semibold text-sapphire disabled:opacity-50"><Link2 size={14}/> Add</button></div>
 {error&&<p className="text-xs text-red-700" role="alert">{error}</p>}<p className="text-[11px] leading-5 text-muted">Without images, the official Sapphire Quest emblem appears on the public package card.</p></div>
}
