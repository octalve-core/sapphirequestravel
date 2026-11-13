import { redirect,notFound } from "next/navigation";
import { currentStaff,canEdit } from "@/server/auth";
import { db } from "@/server/db";
import { AdminShell } from "@/features/admin/components/admin-shell";
import type { EnquiryRow } from "@/server/admin-data";
import { EnquiryDetailView } from "@/features/admin/components/enquiry-detail-view";
export async function EnquiryDetailSection({params}:{params:Promise<{id:string}>}){const user=await currentStaff();if(!user)redirect("/admin/login");const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();const sql=db();const rows=await sql`SELECT id,reference,name,email,phone,service,origin,destination,departure_date::text,return_date::text,travellers,notes,status,created_at::text,assigned_to FROM enquiries WHERE id=${id} LIMIT 1`;if(!rows[0])notFound();const e=rows[0] as EnquiryRow;const [eventRows,agentRows]=await Promise.all([sql`SELECT ev.id,ev.event_type,ev.content,ev.created_at::text,u.name AS actor FROM enquiry_events ev LEFT JOIN staff_users u ON u.id=ev.staff_id WHERE ev.enquiry_id=${id} ORDER BY ev.created_at DESC LIMIT 70`,sql`SELECT id,name FROM staff_users WHERE active=true AND role IN ('owner','manager','agent') ORDER BY name`]);

 return <AdminShell user={user}>
   <EnquiryDetailView
     enquiry={e}
     events={eventRows.map(row=>({
       id:String(row.id),event_type:String(row.event_type),
       content:String(row.content),created_at:String(row.created_at),
       actor:typeof row.actor==="string"?row.actor:null
     }))}
     agents={agentRows.map(row=>({id:String(row.id),name:String(row.name)}))}
     editable={canEdit(user)}
   />
 </AdminShell>;
}
