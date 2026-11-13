import "server-only";
import { db } from "@/server/db";
import { safeFilterDate } from "@/server/date-filter";
import { visaStatusValues } from "@/server/visa-enquiry-schema";
export type VisaStatus=(typeof visaStatusValues)[number];
export type VisaEnquiryRow={
 id:string;reference:string;countryCode:string;countryName:string;city:string;
 visaType:string;travelPurpose:string;intendedDate:string;travellers:number;
 name:string;email:string;phone:string;notes:string;status:VisaStatus;
 assignedTo:string|null;assignedName:string|null;createdAt:string;updatedAt:string;
};
export type VisaFilters={
 q:string;status:"all"|VisaStatus;country:string;type:string;from:string;to:string;page:number;
};
export function readVisaFilters(input:Record<string,string|string[]|undefined>):VisaFilters{
 const get=(key:string)=>typeof input[key]==="string"?input[key] as string:"";
 const status=get("status"),country=get("country").toUpperCase(),type=get("type");
 return {
   q:get("q").slice(0,100),
   status:status==="all"||visaStatusValues.some(x=>x===status)?status as VisaFilters["status"]:"all",
   country:/^[A-Z]{2}$/.test(country)?country:"",
   type:/^[a-z-]{0,30}$/.test(type)?type:"",
   from:safeFilterDate(get("from")),
   to:safeFilterDate(get("to")),
   page:Math.min(Math.max(Number.parseInt(get("page")||"1",10)||1,1),100000),
 };
}
export function visaFilterQuery(f:VisaFilters,page=f.page){
 const q=new URLSearchParams();
 for(const [key,value] of Object.entries(f))if(key!=="page"&&value&&value!=="all")q.set(key,String(value));
 if(page>1)q.set("page",String(page));
 return q.toString();
}
export async function visaEnquiryList(f:VisaFilters,exportAll=false){
 const sql=db(),pattern="%"+f.q.replace(/[%_\\]/g,"\\$&")+"%";
 const limit=exportAll?5001:20,offset=exportAll?0:(f.page-1)*20;
 const rows=await sql`
  SELECT e.id::text AS id,e.reference,e.country_code AS "countryCode",
   e.country_name AS "countryName",e.city,e.visa_type AS "visaType",
   e.travel_purpose AS "travelPurpose",e.intended_travel_date::text AS "intendedDate",
   e.travellers,e.name,e.email,e.phone,e.notes,e.status,
   e.assigned_to::text AS "assignedTo",u.name AS "assignedName",
   e.created_at::text AS "createdAt",e.updated_at::text AS "updatedAt"
  FROM visa_enquiries e LEFT JOIN staff_users u ON u.id=e.assigned_to
  WHERE (${f.status}='all' OR e.status=${f.status})
    AND (${f.country}='' OR e.country_code=${f.country})
    AND (${f.type}='' OR e.visa_type=${f.type})
    AND (${f.from}='' OR e.created_at::date>=NULLIF(${f.from},'')::date)
    AND (${f.to}='' OR e.created_at::date<=NULLIF(${f.to},'')::date)
    AND (${f.q}='' OR e.reference ILIKE ${pattern} ESCAPE '\'
      OR e.name ILIKE ${pattern} ESCAPE '\'
      OR e.email ILIKE ${pattern} ESCAPE '\'
      OR e.phone ILIKE ${pattern} ESCAPE '\'
      OR e.city ILIKE ${pattern} ESCAPE '\')
  ORDER BY e.created_at DESC,e.id DESC LIMIT ${limit} OFFSET ${offset}
 `;
 const counts=await sql`
  SELECT count(*)::int AS total FROM visa_enquiries e
  WHERE (${f.status}='all' OR e.status=${f.status})
    AND (${f.country}='' OR e.country_code=${f.country})
    AND (${f.type}='' OR e.visa_type=${f.type})
    AND (${f.from}='' OR e.created_at::date>=NULLIF(${f.from},'')::date)
    AND (${f.to}='' OR e.created_at::date<=NULLIF(${f.to},'')::date)
    AND (${f.q}='' OR e.reference ILIKE ${pattern} ESCAPE '\'
      OR e.name ILIKE ${pattern} ESCAPE '\'
      OR e.email ILIKE ${pattern} ESCAPE '\'
      OR e.phone ILIKE ${pattern} ESCAPE '\'
      OR e.city ILIKE ${pattern} ESCAPE '\')
 `;
 return {rows:rows as VisaEnquiryRow[],total:Number(counts[0]?.total||0)};
}
export async function visaMetrics(){
 const sql=db();
 const rows=await sql`
  SELECT count(*)::int AS total,
   count(*) FILTER (WHERE status='new')::int AS new_count,
   count(*) FILTER (WHERE status IN ('contacted','quoted','follow_up'))::int AS progress
  FROM visa_enquiries
 `;
 return {total:Number(rows[0]?.total||0),newCount:Number(rows[0]?.new_count||0),inProgress:Number(rows[0]?.progress||0)};
}
