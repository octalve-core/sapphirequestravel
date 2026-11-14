import type { EnquiryRow } from "@/server/admin-data";
import { describeAirport } from "@/server/airport-lookup";
import { EnquiryRecords, type DirectoryRecord } from "@/features/admin/components/enquiry-directory";

const statuses=[
 {value:"new",label:"New"},
 {value:"reviewing",label:"Reviewing"},
 {value:"quoted",label:"Quoted"},
 {value:"awaiting_customer",label:"Awaiting customer"},
 {value:"confirmed",label:"Confirmed"},
 {value:"closed",label:"Closed"},
];

const serviceNames:Record<string,string>={
 flight:"Flight",corporate:"Corporate travel",visa:"Visa assistance",holiday:"Tour",
};

/** The overview uses the SAME desktop rows and mobile cards as the full enquiry directories. */
export function EnquiryTable({rows}:{rows:EnquiryRow[]}){
 const records:DirectoryRecord[]=rows.map(row=>{
   let detail=serviceNames[row.service]||row.service;
   if(row.service==="flight" && row.origin && row.destination){
     detail+=" · "+describeAirport(row.origin)+" → "+describeAirport(row.destination);
   }else if(row.service==="corporate"){
     const location=row.notes?.split("\n").find(line=>line.startsWith("Destination city: "))?.slice("Destination city: ".length);
     if(location)detail+=" · "+location;
     else if(row.destination)detail+=" · "+describeAirport(row.destination);
   }else if(row.destination){
     detail+=" · "+describeAirport(row.destination);
   }
   return {
     id:row.id,href:"/admin/enquiries/"+row.id,reference:row.reference,
     name:row.name,email:row.email,detail,
     createdAt:row.created_at,travelDate:row.departure_date,
     status:row.status,travellers:row.travellers,
   };
 });
 return <EnquiryRecords
   title="Recent general enquiries" total={records.length} rows={records}
   statuses={statuses} columns={{detail:"Service / destination",travelDate:"Travel date"}}
   emptyMessage="No recent general travel enquiries yet."
 />;
}
