import type { Metadata } from "next";
import { VisaEnquiryDetail } from "@/features/admin/sections/visa-enquiry-detail";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Visa enquiry detail",robots:{index:false,follow:false}};
export default async function VisaEnquiryDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  return <VisaEnquiryDetail id={id}/>;
}
