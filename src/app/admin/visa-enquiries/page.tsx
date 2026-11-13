import type { Metadata } from "next";
import { VisaEnquiriesSection } from "@/features/admin/sections/visa-enquiries-section";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Visa enquiries",robots:{index:false,follow:false}};
export default function VisaEnquiriesPage({searchParams}:{
  searchParams:Promise<Record<string,string|string[]|undefined>>;
}){
 return <VisaEnquiriesSection searchParams={searchParams}/>;
}
