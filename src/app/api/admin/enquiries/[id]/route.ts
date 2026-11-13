import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { currentStaff,canEdit } from "@/server/auth";
import { consentOrigin } from "@/server/security";
import { db } from "@/server/db";
export const runtime="nodejs";
const changeSchema=z.discriminatedUnion("action",[
 z.object({action:z.literal("status"),status:z.enum(["new","reviewing","quoted","awaiting_customer","confirmed","closed"])}),
 z.object({action:z.literal("note"),note:z.string().trim().min(2).max(2000)}),
 z.object({action:z.literal("assign"),staffId:z.string().uuid().nullable()}),
 z.object({action:z.literal("manage"),status:z.enum(["new","reviewing","quoted","awaiting_customer","confirmed","closed"]),staffId:z.string().uuid().nullable()})
]);
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!consentOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const user=await currentStaff();if(!user||!canEdit(user))return NextResponse.json({error:"Not permitted"},{status:403});
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid ID"},{status:400});
 if(Number(req.headers.get("content-length")??0)>6000)return NextResponse.json({error:"Request too large"},{status:413});
 let p:unknown;try{p=await req.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const result=changeSchema.safeParse(p);if(!result.success)return NextResponse.json({error:"Invalid request"},{status:422});
 try{const sql=db();const found=await sql`SELECT id FROM enquiries WHERE id=${id}`;if(!found.length)return NextResponse.json({error:"Enquiry not found"},{status:404});const x=result.data;

  // Update status and assignment in one transactionally atomic SQL statement.
  // Existing status, assign and note actions stay supported for older clients.
  if(x.action==="manage"){
    if(x.staffId){
      const people=await sql`SELECT id FROM staff_users WHERE id=${x.staffId} AND active=true AND role IN ('owner','manager','agent') LIMIT 1`;
      if(!people.length)return NextResponse.json({error:"Invalid assignee"},{status:422});
    }
    const message="Updated status to "+x.status+"; assigned staff "+(x.staffId||"unassigned");
    const updated=await sql`
      WITH changed AS (
        UPDATE enquiries SET status=${x.status},assigned_to=${x.staffId},
          updated_at=now() WHERE id=${id} RETURNING id
      ), history AS (
        INSERT INTO enquiry_events(enquiry_id,staff_id,event_type,content)
        SELECT id,${user.id},'status',${message} FROM changed RETURNING enquiry_id
      ), audit AS (
        INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id)
        SELECT ${user.id},'enquiry.manage','enquiry',id::text FROM changed RETURNING entity_id
      ) SELECT id FROM changed
    `;
    if(!updated.length)return NextResponse.json({error:"Enquiry not found"},{status:404});
    return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
  }
  if(x.action==="status")await sql`UPDATE enquiries SET status=${x.status},updated_at=now() WHERE id=${id}`;
  if(x.action==="assign"){
   if(x.staffId){const person=await sql`SELECT id FROM staff_users WHERE id=${x.staffId} AND active=true AND role IN ('owner','manager','agent')`;if(!person.length)return NextResponse.json({error:"Invalid assignee"},{status:422})}
   await sql`UPDATE enquiries SET assigned_to=${x.staffId},updated_at=now() WHERE id=${id}`;
  }
  const msg=x.action==="status"?`Changed status to ${x.status}`:x.action==="assign"?`Changed assignee to ${x.staffId??"unassigned"}`:x.note;
  await sql`INSERT INTO enquiry_events(enquiry_id,staff_id,event_type,content) VALUES(${id},${user.id},${x.action},${msg})`;
  await sql`INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id) VALUES(${user.id},${`enquiry.${x.action}`},'enquiry',${id})`;
  return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("Admin enquiry update failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Unable to save changes"},{status:503})}
}
