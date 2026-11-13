import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { currentStaff,canManage } from "@/server/auth";
import { consentOrigin } from "@/server/security";
import { packageSchema } from "@/server/package-schema";
export const runtime="nodejs";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!consentOrigin(req))return NextResponse.json({error:"Invalid origin"},{status:403});
 const staff=await currentStaff();if(!staff||!canManage(staff))return NextResponse.json({error:"Not permitted"},{status:403});
 const {id}=await params;if(!z.string().uuid().safeParse(id).success)return NextResponse.json({error:"Invalid package ID"},{status:400});
 if(Number(req.headers.get("content-length")||0)>30000)return NextResponse.json({error:"Package too large"},{status:413});
 const parsed=packageSchema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message || "Invalid package details"},{status:422});
 const x=parsed.data;
 try {const sql=db();const rows=await sql`WITH changed AS (
  UPDATE travel_packages SET title=${x.title},slug=${x.slug},summary=${x.summary},destination=${x.destination},status=${x.status},highlights=${x.highlights},price_amount=${x.priceAmount},currency=${x.currency},discount_percent=${x.discountPercent},features=${JSON.stringify(x.features)}::jsonb,images=${JSON.stringify(x.images)}::jsonb,details=${JSON.stringify(x.details)}::jsonb,hero_image=${x.images[0]||""},rating_score=${x.ratingScore},rating_count=${x.ratingCount},rating_source=${x.ratingSource},updated_at=now()
  WHERE id=${id} RETURNING id
 ), logged AS (
  INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id) SELECT ${staff.id},'package.update','package',id::text FROM changed RETURNING id
 ) SELECT id FROM changed`;
 if(!rows.length)return NextResponse.json({error:"Package not found"},{status:404});
 return NextResponse.json({ok:true});
 }catch(err){console.error("package update failed",err instanceof Error?err.message:"unknown");return NextResponse.json({error:"Unable to save package. Check the slug and verify migration 001."},{status:409})}
}
