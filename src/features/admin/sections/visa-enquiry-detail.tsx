import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { ArrowLeft,CalendarDays,Mail,Phone,Users } from "lucide-react";
import { currentStaff,canEdit } from "@/server/auth";
import { db } from "@/server/db";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { VisaEnquiryActions } from "@/features/admin/components/visa-enquiry-actions";
import { packageStatusLabels,packageStatusClasses } from "@/features/admin/lib/package-status";
import { visaTypes,visaPurposes } from "@/server/visa-enquiry-schema";
import type { VisaEnquiryRow } from "@/server/visa-enquiry-data";

type Event={id:string;eventType:string;content:string;staffName:string|null;createdAt:string};
type StaffMember={id:string;name:string};
export async function VisaEnquiryDetail({id}:{id:string}){
 const staff=await currentStaff();
 if(!staff)redirect("/admin/login");
 if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 let item:VisaEnquiryRow|undefined,events:Event[]=[],staffList:StaffMember[]=[];
 try{
   const sql=db();
   const [records,history,team]=await Promise.all([
     sql`SELECT e.id::text AS id,e.reference,e.country_code AS "countryCode",
       e.country_name AS "countryName",e.city,e.visa_type AS "visaType",
       e.travel_purpose AS "travelPurpose",e.intended_travel_date::text AS "intendedDate",
       e.travellers,e.name,e.email,e.phone,e.notes,e.status,
       e.assigned_to::text AS "assignedTo",u.name AS "assignedName",
       e.created_at::text AS "createdAt",e.updated_at::text AS "updatedAt"
       FROM visa_enquiries e LEFT JOIN staff_users u ON u.id=e.assigned_to
       WHERE e.id=${id} LIMIT 1`,
     sql`SELECT e.id::text AS id,e.event_type AS "eventType",e.content,
       u.name AS "staffName",e.created_at::text AS "createdAt"
       FROM visa_enquiry_events e LEFT JOIN staff_users u ON u.id=e.staff_id
       WHERE e.enquiry_id=${id} ORDER BY e.created_at DESC LIMIT 100`,
     sql`SELECT id::text AS id,name FROM staff_users
       WHERE active=true AND role IN ('owner','manager','agent') ORDER BY name LIMIT 100`,
   ]);
   item=records[0] as VisaEnquiryRow|undefined;
   events=history as Event[];staffList=team as StaffMember[];
 }catch{
   return <AdminShell user={staff}><p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">Could not load this visa request. Verify the visa database migration and connection.</p></AdminShell>;
 }
 if(!item)notFound();
 const fields=[
   ["Destination",item.city+", "+item.countryName],
   ["Visa type",visaTypes.find(t=>t.value===item!.visaType)?.label||item.visaType],
   ["Travel purpose",visaPurposes.find(t=>t.value===item!.travelPurpose)?.label||item.travelPurpose],
   ["Intended travel date",item.intendedDate],
   ["Travellers",String(item.travellers)],
   ["Assigned to",item.assignedName||"Unassigned"],
   ["Submitted",new Date(item.createdAt).toLocaleString("en-NG")],
 ];
 return <AdminShell user={staff}>
   <Link href="/admin/visa-enquiries" className="mb-7 inline-flex items-center gap-2 text-xs font-medium text-sapphire"><ArrowLeft size={15}/> All visa enquiries</Link>
   <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
     <div><p className="eyebrow">Visa enquiry · {item.reference}</p><h1 className="display-heading mt-3 text-3xl text-navy">Visa assistance request</h1></div>
     <span className={"rounded-full px-4 py-2 text-xs font-medium "+packageStatusClasses[item.status]}>{packageStatusLabels[item.status]}</span>
   </div>
   <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,.8fr)]">
     <div className="space-y-6">
       <section className="rounded-2xl border border-[#e3eaf3] bg-white p-6 sm:p-8">
         <h2 className="text-lg font-medium text-navy">Customer & visa details</h2>
         <p className="mt-5 text-xl font-medium text-navy">{item.name}</p>
         <a className="mt-3 flex items-center gap-2 text-sm text-sapphire" href={"mailto:"+item.email}><Mail size={15}/>{item.email}</a>
         <a className="mt-3 flex items-center gap-2 text-sm text-sapphire" href={"tel:"+item.phone.replace(/[^\d+]/g,"")}><Phone size={15}/>{item.phone}</a>
         <div className="mt-7 grid gap-5 border-t border-[#edf1f6] pt-6 sm:grid-cols-2">
           {fields.map(([label,value])=><div key={label}><p className="text-[11px] text-muted">{label}</p><p className="mt-1 text-[13px] font-medium text-navy">{value}</p></div>)}
         </div>
         {item.notes&&<div className="mt-6 border-t border-[#edf1f6] pt-5"><p className="text-xs text-muted">Customer notes</p><p className="mt-2 whitespace-pre-wrap text-[13px] leading-7 text-navy">{item.notes}</p></div>}
       </section>
       <section className="rounded-2xl border border-[#e3eaf3] bg-white p-6 sm:p-8">
         <h2 className="text-lg font-medium text-navy">Activity history</h2>
         <div className="mt-4 divide-y divide-[#edf1f6]">
           {events.map(e=><div key={e.id} className="py-4">
             <div className="flex justify-between gap-4">
               <p className="text-xs font-medium capitalize text-sapphire">{e.eventType}</p>
               <p className="text-[11px] text-muted">{new Date(e.createdAt).toLocaleString("en-NG")}</p>
             </div>
             <p className="mt-2 whitespace-pre-wrap text-[13px] leading-6 text-navy">{e.content}</p>
             {e.staffName&&<p className="mt-1 text-[11px] text-muted">{e.staffName}</p>}
           </div>)}
         </div>
       </section>
     </div>
     {canEdit(staff)&&<div className="rounded-2xl border border-[#e3eaf3] bg-white p-6 sm:p-8">
       <VisaEnquiryActions id={item.id} status={item.status} assignedTo={item.assignedTo} assignees={staffList}/>
     </div>}
   </div>
 </AdminShell>;
}
