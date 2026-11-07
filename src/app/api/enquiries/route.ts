import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { consumeRateLimit, consentOrigin,requestIp } from "@/server/security";
import { enquirySchema } from "@/server/enquiry-schema";
import { notifyNewEnquiry } from "@/server/notifications";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!consentOrigin(req))return NextResponse.json({error:"Invalid request origin"},{status:403});
 if(Number(req.headers.get("content-length")??0)>16000)return NextResponse.json({error:"Request too large"},{status:413});
 let payload:unknown;try{payload=await req.json()}catch{return NextResponse.json({error:"Invalid request body"},{status:400})}
 const parsed=enquirySchema.safeParse(payload);if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"Please check your form"},{status:422});
 const x=parsed.data;
 if(x.website)return NextResponse.json({ok:true,reference:"SQ-RECEIVED"}); // honeypot: intentionally no persistence
 try{
  const blocked=await consumeRateLimit(`enquiry:${requestIp(req)}:${x.email}`,5,15);
  if(blocked)return NextResponse.json({error:"Too many requests. Please contact our team directly."},{status:429});
  const sql=db();const reference=`SQ-${new Date().getUTCFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`;
  await sql`WITH created AS (
   INSERT INTO enquiries(reference,service,name,email,phone,origin,destination,departure_date,return_date,travellers,notes)
   VALUES(${reference},${x.service},${x.name},${x.email},${x.phone},${x.service==="flight"?x.origin:null},${x.service==="flight"?x.destination:null},${x.service==="flight"?x.departureDate:null},${x.service==="flight"&&x.returnDate?x.returnDate:null},${x.service==="flight"?x.travellers:1},${x.notes})
   RETURNING id
  ) INSERT INTO enquiry_events(enquiry_id,event_type,content)
   SELECT id,'created','Customer submitted enquiry' FROM created`;
  await notifyNewEnquiry({reference,name:x.name,service:x.service});
  return NextResponse.json({ok:true,reference},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(err){console.error("Enquiry submission unavailable",err instanceof Error?err.message:"unknown");return NextResponse.json({error:"Our enquiry service is temporarily unavailable. Please email info@sapphirequesttravel.com."},{status:503})}
}
