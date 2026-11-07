import type { Metadata } from "next";
import { EnquiriesSection } from "@/features/admin/sections/enquiries-section.tsx";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Enquiries",robots:{index:false,follow:false}};
export default function Enquiries({searchParams}:{searchParams:Promise<{status?:string,page?:string}>}){return <EnquiriesSection searchParams={searchParams}/>}
