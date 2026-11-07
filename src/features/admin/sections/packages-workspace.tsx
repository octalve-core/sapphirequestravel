import { redirect } from "next/navigation";
import { currentStaff,canManage } from "@/server/auth";
import { db } from "@/server/db";
import { emptyPackage, type PackageRecord } from "@/server/package-schema";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { PackageForm } from "@/features/admin/components/package-form";
import { PackageEditor } from "@/features/admin/components/package-editor";
export async function PackagesWorkspace(){
 const staff=await currentStaff();if(!staff)redirect("/admin/login");
 let records:PackageRecord[]=[];let migrationReady=true;let error="";
 try {const sql=db();records=(await sql`SELECT id,title,slug,summary,destination,status,highlights,price_amount::float AS "priceAmount",currency,discount_percent AS "discountPercent",features,images,details FROM travel_packages ORDER BY created_at DESC LIMIT 100`) as PackageRecord[]}
 catch {migrationReady=false;try{const sql=db();const old=(await sql`SELECT id,title,slug,summary,destination,status FROM travel_packages ORDER BY created_at DESC LIMIT 100`) as {id:string,title:string,slug:string,summary:string,destination:string,status:"draft"|"published"}[];
 records=old.map(x=>({...emptyPackage(),...x}));}catch {error="Could not load packages. Verify the Neon connection."}}
 return <AdminShell user={staff}><p className="eyebrow">Content management</p><h1 className="display-heading mt-3 text-3xl">Travel packages</h1><p className="mb-9 mt-3 max-w-3xl text-sm leading-7 text-muted">Manage draft and published packages, featured images, inclusions, details and indicative prices. All packages remain enquiry-led; publishing does not confirm availability or enable payments.</p>
 {!migrationReady&&<div className="mb-7 rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm leading-7 text-[#775115]">The enhanced package editor requires migration <code>db/migrations/001_enhanced_packages.sql</code> in Neon SQL Editor. Editing is safely disabled until the schema is upgraded. The migration retains all existing data and creates three private sample drafts.</div>}
 {error&&<div className="mb-6 rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</div>}
 <div className="grid items-start gap-7 xl:grid-cols-[1fr_.9fr]"><div className="surface-card p-6"><h2 className="mb-6 text-lg font-semibold">Existing packages <span className="ml-2 text-sm font-normal text-muted">({records.length})</span></h2>{records.length?records.map(p=>canManage(staff)&&migrationReady?<PackageEditor key={p.id} data={p}/>:<div key={p.id} className="border-b border-[#eef1f5] py-4"><p className="font-semibold">{p.title}</p><p className="text-xs text-muted">{p.destination} · {p.status}</p></div>):<p className="text-sm text-muted">No packages yet. Run the sample-draft migration or create a new one.</p>}</div>{canManage(staff)&&migrationReady?<PackageForm/>:<div className="surface-card p-6 text-sm text-muted">{migrationReady?"Your account has read-only access.":"Package editing will appear once the database migration is applied."}</div>}</div></AdminShell>;
}
