import "server-only";
import { db } from "@/server/db";
import { safeFilterDate } from "@/server/date-filter";
import type { EnquiryRow } from "@/server/admin-data";
export const generalStatuses=["new","reviewing","quoted","awaiting_customer","confirmed","closed"] as const;
export const generalServices=["flight","corporate","visa","holiday"] as const;
export type GeneralFilters={
 q:string;status:"all"|(typeof generalStatuses)[number];
 service:""|(typeof generalServices)[number];from:string;to:string;page:number;
};
export function readGeneralFilters(query:Record<string,string|string[]|undefined>):GeneralFilters{
 const get=(key:string)=>typeof query[key]==="string" ? query[key] as string : "";
 const status=get("status"),service=get("service");
 return {
  q:get("q").slice(0,100),
  status:generalStatuses.some(x=>x===status)?status as GeneralFilters["status"]:"all",
  service:generalServices.some(x=>x===service)?service as GeneralFilters["service"]:"",
  from:safeFilterDate(get("from")),to:safeFilterDate(get("to")),
  page:Math.min(100000,Math.max(1,Number.parseInt(get("page")||"1",10)||1)),
 };
}
export function generalFilterParams(f:GeneralFilters,page=1):string{
 const query=new URLSearchParams();
 if(f.q)query.set("q",f.q);
 if(f.status!=="all")query.set("status",f.status);
 if(f.service)query.set("service",f.service);
 if(f.from)query.set("from",f.from);
 if(f.to)query.set("to",f.to);
 if(page>1)query.set("page",String(page));
 return query.toString();
}
export async function listGeneralEnquiries(f:GeneralFilters,exportAll=false){
 const sql=db();
 const pattern="%"+f.q.replace(/[%_\\]/g,"\\$&")+"%";
 const take=exportAll?5001:20,skip=exportAll?0:(f.page-1)*20;
 const rows=await sql`SELECT e.id::text AS id,e.reference,e.name,e.email,e.phone,
  e.service,e.origin,e.destination,e.departure_date::text,e.return_date::text,
  e.travellers,e.notes,e.status,e.created_at::text,e.assigned_to::text
  FROM enquiries e
  WHERE (${f.status}='all' OR e.status=${f.status})
    AND (${f.service}='' OR e.service=${f.service})
    AND (${f.from}='' OR e.created_at::date>=NULLIF(${f.from},'')::date)
    AND (${f.to}='' OR e.created_at::date<=NULLIF(${f.to},'')::date)
    AND (${f.q}='' OR e.reference ILIKE ${pattern} ESCAPE '\'
      OR e.name ILIKE ${pattern} ESCAPE '\'
      OR e.email ILIKE ${pattern} ESCAPE '\'
      OR e.phone ILIKE ${pattern} ESCAPE '\'
      OR e.notes ILIKE ${pattern} ESCAPE '\')
  ORDER BY e.created_at DESC,e.id DESC LIMIT ${take} OFFSET ${skip}`;
 const counts=await sql`SELECT count(*)::int AS total FROM enquiries e
  WHERE (${f.status}='all' OR e.status=${f.status})
    AND (${f.service}='' OR e.service=${f.service})
    AND (${f.from}='' OR e.created_at::date>=NULLIF(${f.from},'')::date)
    AND (${f.to}='' OR e.created_at::date<=NULLIF(${f.to},'')::date)
    AND (${f.q}='' OR e.reference ILIKE ${pattern} ESCAPE '\'
      OR e.name ILIKE ${pattern} ESCAPE '\'
      OR e.email ILIKE ${pattern} ESCAPE '\'
      OR e.phone ILIKE ${pattern} ESCAPE '\'
      OR e.notes ILIKE ${pattern} ESCAPE '\')`;
 return {rows:rows as EnquiryRow[],total:Number(counts[0]?.total||0)};
}
