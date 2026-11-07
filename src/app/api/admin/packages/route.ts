import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { currentStaff,canManage } from "@/server/auth";
import { db } from "@/server/db";
import { consentOrigin } from "@/server/security";
export const runtime="nodejs";
const schema=z.object({title:z.string().trim().min(4).max(120),slug:z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(130),summary:z.string().trim().max(750),destination:z.string().trim().max(100),status:z.enum(["draft","published"])});
export async function POST(req:NextRequest){if(!consentOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});const user=await currentStaff();if(!user||!canManage(user))return NextResponse.json({error:"Not permitted"},{status:403});const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid package"},{status:422});try{const sql=db();const x=parsed.data;const rows=await sql`INSERT INTO travel_packages(title,slug,summary,destination,status) VALUES(${x.title},${x.slug},${x.summary},${x.destination},${x.status}) RETURNING id`;await sql`INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id) VALUES(${user.id},'package.create','package',${String(rows[0].id)})`;return NextResponse.json({ok:true},{status:201})}catch{return NextResponse.json({error:"Unable to create package. Please use a unique slug."},{status:409})}}
