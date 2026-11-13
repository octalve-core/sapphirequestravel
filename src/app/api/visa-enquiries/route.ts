import { NextRequest, NextResponse, after } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { visaEnquirySchema } from "@/server/visa-enquiry-schema";
import { countryName } from "@/data/countries";
import { consumeRateLimit, consentOrigin, requestIp } from "@/server/security";
import { notifyNewEnquiry } from "@/server/notifications";
export const runtime="nodejs";
export async function POST(req: NextRequest) {
  if(!consentOrigin(req)) return NextResponse.json({error:"Invalid request origin"},{status:403});
  if(Number(req.headers.get("content-length")||0)>12000)
    return NextResponse.json({error:"Request too large"},{status:413});
  const parsed=visaEnquirySchema.safeParse(await req.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:parsed.error.issues[0]?.message ||"Please check the visa information"},{status:422});
  const x=parsed.data;
  if(x.website) return NextResponse.json({ok:true,reference:"SQ-RECEIVED"},{status:202});
  try {
    if(await consumeRateLimit("visa:"+requestIp(req)+":"+x.email,5,15))
      return NextResponse.json({error:"Too many requests. Contact Sapphire Quest directly."},{status:429});
    const reference="SQV-"+new Date().getUTCFullYear()+"-"+randomBytes(5).toString("hex").toUpperCase();
    const sql=db();
    await sql`WITH created AS (
      INSERT INTO visa_enquiries
        (reference,country_code,country_name,city,visa_type,travel_purpose,
         intended_travel_date,travellers,name,email,phone,notes)
      VALUES (${reference},${x.countryCode},${countryName(x.countryCode)},${x.city},
        ${x.visaType},${x.travelPurpose},${x.intendedDate},${x.travellers},
        ${x.name},${x.email},${x.phone},${x.notes}) RETURNING id
    ), history AS (
      INSERT INTO visa_enquiry_events(enquiry_id,event_type,content)
      SELECT id,'created','New visa assistance request' FROM created RETURNING enquiry_id
    )
    INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id)
    SELECT NULL,'visa_enquiry.created','visa_enquiry',id::text FROM created`;
    after(() => notifyNewEnquiry({reference,name:x.name,email:x.email,service:"Visa assistance",dashboardPath:"/admin/visa-enquiries"}));
    return NextResponse.json({ok:true,reference},{status:201,headers:{"Cache-Control":"no-store"}});
  } catch(e) {
    console.error("Visa enquiry unavailable",e instanceof Error?e.message:"unknown");
    return NextResponse.json({error:"We couldn't send your request. Please email info@sapphirequesttravel.com."},{status:503});
  }
}
