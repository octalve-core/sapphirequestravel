import type { Metadata } from "next";
import { RequestSection } from "@/features/request/sections/request-section";
export const metadata:Metadata={title:"Plan your journey"};
export default async function RequestPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const p=await searchParams;const safe=(key:string)=>typeof p[key]==="string"?String(p[key]):"";const kind=safe("service");const service=kind==="visa"||kind==="holiday"||kind==="corporate"?kind:"flight";return <RequestSection initial={{service,from:safe("from")||undefined,to:safe("to")||undefined,departure:safe("departure")||undefined,returnDate:safe("return")||undefined,passengers:Math.max(1,Math.min(20,Number(safe("passengers"))||1)),packageSlug:safe("package")||undefined}}/>}
