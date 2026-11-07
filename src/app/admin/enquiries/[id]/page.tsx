import type { Metadata } from "next";
import { EnquiryDetailSection } from "@/features/admin/sections/enquiry-detail-section";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Enquiry details",robots:{index:false,follow:false}};
export default function EnquiryDetail({params}:{params:Promise<{id:string}>}){return <EnquiryDetailSection params={params}/>}
