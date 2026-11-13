import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { currentStaff,canEdit } from "@/server/auth";
import { consentOrigin } from "@/server/security";
import { visaChangeSchema } from "@/server/visa-enquiry-schema";
export const runtime="nodejs";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!consentOrigin(req))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const staff=await currentStaff();
 if(!staff||!canEdit(staff))return NextResponse.json({error:"Not permitted"},{status:403});
 const {id}=await params;
 if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid request ID"},{status:400});
 if(Number(req.headers.get("content-length")||0)>6000)return NextResponse.json({error:"Request too large"},{status:413});
 const parsed=visaChangeSchema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:"Check the update details"},{status:422});
 const change=parsed.data;
 const action=change.action;
 const newStatus=action==="status"?change.status:null;
 const newAssignee=action==="assign"?change.staffId:null;
 const eventType=action==="assign"?"assignment":action;
 const note=action==="status"?"Status changed to "+change.status:
   action==="assign"?"Assigned to "+(change.staffId||"unassigned"):change.note;
 try{
   const sql=db();
   if(action==="assign"&&newAssignee){
     const valid=await sql`SELECT id FROM staff_users WHERE id=${newAssignee}
       AND active=true AND role IN ('owner','manager','agent') LIMIT 1`;
     if(!valid.length)return NextResponse.json({error:"Select an active team member"},{status:422});
   }
   const rows=await sql`WITH changed AS (
     UPDATE visa_enquiries SET
       status=CASE WHEN ${action}='status' THEN ${newStatus} ELSE status END,
       assigned_to=CASE WHEN ${action}='assign' THEN ${newAssignee}::uuid ELSE assigned_to END,
       updated_at=now() WHERE id=${id} RETURNING id
   ), event AS (
     INSERT INTO visa_enquiry_events(enquiry_id,staff_id,event_type,content)
     SELECT id,${staff.id},${eventType},${note} FROM changed RETURNING enquiry_id
   ), audit AS (
     INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id)
     SELECT ${staff.id},${"visa_enquiry."+action},'visa_enquiry',id::text FROM changed RETURNING entity_id
   ) SELECT id FROM changed`;
   if(!rows.length)return NextResponse.json({error:"Request not found"},{status:404});
   return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
 }catch(e){
   console.error("Visa request update failed",e instanceof Error?e.message:"unknown");
   return NextResponse.json({error:"Unable to save this update"},{status:503});
 }
}
