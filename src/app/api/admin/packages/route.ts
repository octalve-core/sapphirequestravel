import { NextRequest,NextResponse } from "next/server";
import { currentStaff,canManage } from "@/server/auth";
import { db } from "@/server/db";
import { consentOrigin } from "@/server/security";
import { packageSchema } from "@/server/package-schema";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!consentOrigin(req))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const staff=await currentStaff();if(!staff||!canManage(staff))return NextResponse.json({error:"Not permitted"},{status:403});
 if(Number(req.headers.get("content-length")||0)>30000)return NextResponse.json({error:"Package too large"},{status:413});
 const parsed=packageSchema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message || "Invalid package details"},{status:422});
 const x=parsed.data;
 try {const sql=db();await sql`WITH new_package AS (
  INSERT INTO travel_packages(title,slug,summary,destination,status,highlights,price_amount,currency,discount_percent,features,images,details,hero_image,rating_score,rating_count,rating_source)
  VALUES(${x.title},${x.slug},${x.summary},${x.destination},${x.status},${x.highlights},${x.priceAmount},${x.currency},${x.discountPercent},${JSON.stringify(x.features)}::jsonb,${JSON.stringify(x.images)}::jsonb,${JSON.stringify(x.details)}::jsonb,${x.images[0]||""},${x.ratingScore},${x.ratingCount},${x.ratingSource})
  RETURNING id
 ) INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id)
 SELECT ${staff.id},'package.create','package',id::text FROM new_package`;
 return NextResponse.json({ok:true},{status:201});
 }catch(err){console.error("package create failed",err instanceof Error?err.message:"unknown");return NextResponse.json({error:"Unable to create package. Check the slug and ensure package migration 001 is applied."},{status:409})}
}
