import { NextRequest, NextResponse } from "next/server";
import { currentStaff,canManage } from "@/server/auth";
import { excelCsvRow } from "@/server/excel-csv";
import { readVisaFilters,visaEnquiryList } from "@/server/visa-enquiry-data";
export const runtime="nodejs";
export async function GET(req:NextRequest){
 const staff=await currentStaff();
 if(!staff||!canManage(staff))return NextResponse.json({error:"Not permitted"},{status:403});
 const filters=readVisaFilters(Object.fromEntries(req.nextUrl.searchParams));
 try{
   const data=await visaEnquiryList(filters,true);
   if(data.total>5000)return NextResponse.json({error:"Narrow filters to export a maximum of 5,000 records."},{status:422});
   const headers=["Reference","Submitted","Customer","Email","Phone","Country","City","Visa type","Travel purpose","Travel date","Travellers","Status","Assigned to","Notes"];
   const records=data.rows.map(x=>excelCsvRow([
     x.reference,x.createdAt,x.name,x.email,x.phone,x.countryName,x.city,
     x.visaType,x.travelPurpose,x.intendedDate,x.travellers,x.status,x.assignedName,x.notes,
   ],[0,4]));
   const file="\uFEFF"+[excelCsvRow(headers),...records].join("\r\n")+"\r\n";
   return new NextResponse(file,{headers:{
     "Content-Type":"text/csv; charset=utf-8",
     "Content-Disposition":'attachment; filename="sapphire-quest-visa-enquiries.csv"',
     "Cache-Control":"private, no-store",
     "X-Content-Type-Options":"nosniff",
   }});
 }catch{return NextResponse.json({error:"Export unavailable. Please verify the visa database migration."},{status:503});}
}
