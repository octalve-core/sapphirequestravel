import { NextRequest, NextResponse } from "next/server";
import { validCountryCodes } from "@/data/countries";
export const runtime = "nodejs";
type City = { id: number; name: string; region?: string };
export async function GET(req: NextRequest) {
  const country=(req.nextUrl.searchParams.get("country")||"").toUpperCase();
  const q=(req.nextUrl.searchParams.get("q")||"").trim();
  if(!validCountryCodes.has(country) || !/^[\p{L}\p{M} .'-]{2,60}$/u.test(q))
    return NextResponse.json({results:[]},{headers:{"Cache-Control":"no-store"}});
  const params=new URLSearchParams({countryIds:country,namePrefix:q,limit:"10",sort:"-population",types:"CITY"});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);
  try {
    const response=await fetch("https://geodb-free-service.wirefreethought.com/v1/geo/cities?"+params,
      {signal:controller.signal,next:{revalidate:3600},headers:{Accept:"application/json"}});
    if(!response.ok) throw new Error("GeoDB HTTP "+response.status);
    const json=await response.json() as {data?:{id:number;name:string;region?:string}[]};
    const results:City[]=(json.data||[]).filter(x=>x&&Number.isInteger(x.id)&&typeof x.name==="string")
      .map(x=>({id:x.id,name:x.name,region:x.region})).slice(0,10);
    return NextResponse.json({results},{headers:{"Cache-Control":"public, max-age=120, s-maxage=3600"}});
  } catch {
    return NextResponse.json({results:[],unavailable:true},{headers:{"Cache-Control":"no-store"}});
  } finally {clearTimeout(timer);}
}
