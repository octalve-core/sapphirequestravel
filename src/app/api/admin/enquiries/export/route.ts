import { NextRequest,NextResponse } from "next/server";
import { currentStaff,canManage } from "@/server/auth";
import { readGeneralFilters,listGeneralEnquiries } from "@/server/general-enquiry-data";
import { excelCsvRow } from "@/server/excel-csv";
export const runtime="nodejs";
export async function GET(request:NextRequest){
 const staff=await currentStaff();
 if(!staff||!canManage(staff))return NextResponse.json({error:"Not permitted"},{status:403});
 const filters=readGeneralFilters(Object.fromEntries(request.nextUrl.searchParams));
 try{
   const result=await listGeneralEnquiries(filters,true);
   if(result.total>5000)return NextResponse.json({error:"Use narrower filters to export a maximum of 5,000 rows."},{status:422});
   const header=["Reference","Created","Customer","Email","Phone","Service","Origin","Destination","Departure","Return","Travellers","Status","Notes"];
   const records=result.rows.map(item=>excelCsvRow([
     item.reference,item.created_at,item.name,item.email,item.phone,item.service,
     item.origin,item.destination,item.departure_date,item.return_date,item.travellers,item.status,item.notes,
   ],[0,4]));
   return new NextResponse("\uFEFF"+[excelCsvRow(header),...records].join("\r\n")+"\r\n",{
     headers:{"Content-Type":"text/csv; charset=utf-8",
       "Content-Disposition":'attachment; filename="sapphire-quest-general-enquiries.csv"',
       "Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"},
   });
 }catch{return NextResponse.json({error:"The export is currently unavailable."},{status:503});}
}
