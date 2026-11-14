import type { Metadata } from "next";
import { ReportsSection } from "@/features/admin/sections/reports-section";
export const dynamic="force-dynamic";
export const metadata:Metadata={
 title:"Reports & Insights",
 description:"Private Sapphire Quest enquiry and operations reporting.",
 robots:{index:false,follow:false},
};
export default function Reports({searchParams}:{
 searchParams:Promise<{days?:string|string[]}>;
}){
 return <ReportsSection searchParams={searchParams}/>;
}
