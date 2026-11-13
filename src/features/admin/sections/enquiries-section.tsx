import { redirect } from "next/navigation";
import { currentStaff,canManage } from "@/server/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { EnquiryDirectory, type DirectoryRecord } from "@/features/admin/components/enquiry-directory";
import { describeAirport } from "@/server/airport-lookup";
import { generalStatuses,generalServices,readGeneralFilters,listGeneralEnquiries,generalFilterParams } from "@/server/general-enquiry-data";

const labels:Record<string,string>={new:"New",reviewing:"Reviewing",quoted:"Quoted",awaiting_customer:"Awaiting customer",confirmed:"Confirmed",closed:"Closed"};
const serviceNames:Record<string,string>={flight:"Flight",corporate:"Corporate travel",visa:"Visa assistance",holiday:"Tours"};

export async function EnquiriesSection({searchParams}:{
 searchParams:Promise<Record<string,string|string[]|undefined>>;
}){
 const staff=await currentStaff();
 if(!staff)redirect("/admin/login");
 const filters=readGeneralFilters(await searchParams);
 let data:Awaited<ReturnType<typeof listGeneralEnquiries>>={rows:[],total:0};
 let error="";
 try{data=await listGeneralEnquiries(filters);}
 catch{error="Unable to load enquiries. Check the Neon database connection.";}
 const active:Record<string,string>={
  q:filters.q,status:filters.status,service:filters.service,from:filters.from,to:filters.to,
 };
 const records:DirectoryRecord[]=data.rows.map(row=>{
   let detail=serviceNames[row.service]||row.service;
   if(row.service==="flight"){
     detail+=" · "+describeAirport(row.origin)+" → "+describeAirport(row.destination);
   }else if(row.service==="corporate"){
     const location=row.notes?.split("\n").find(line=>line.startsWith("Destination city: "))?.slice(18);
     detail+=" · "+(location||describeAirport(row.destination));
   }else if(row.destination){
     detail+=" · "+describeAirport(row.destination);
   }
   return {
    id:row.id,href:"/admin/enquiries/"+row.id,reference:row.reference,
    name:row.name,email:row.email,detail,travelDate:row.departure_date,
    createdAt:row.created_at,status:row.status,travellers:row.travellers,
   };
 });
 const query=generalFilterParams(filters);
 return <AdminShell user={staff}>
   <EnquiryDirectory
     title="Enquiries" description="Review, assign and follow up on individual flight and corporate travel requests."
     eyebrow="Travel operations" path="/admin/enquiries" rows={records}
     total={data.total} page={filters.page} pageSize={20}
     statuses={generalStatuses.map(value=>({value,label:labels[value]}))}
     active={active} columns={{detail:"Service / destination",travelDate:"Travel date"}}
     exportHref={canManage(staff)&&!error?"/api/admin/enquiries/export"+(query?"?"+query:""):undefined}
     error={error} emptyMessage="No enquiries match these filters."
     filterFields={<>
       <label className="block text-[11px] font-medium text-[#53647e]">Service
         <select name="service" defaultValue={filters.service} className="input-field mt-1 min-h-10 text-xs">
           <option value="">All services</option>
           {generalServices.map(value=><option key={value} value={value}>{serviceNames[value]}</option>)}
         </select>
       </label>
       <label className="block text-[11px] font-medium text-[#53647e]">Submitted from
         <input name="from" type="date" defaultValue={filters.from} className="input-field mt-1 min-h-10 text-xs"/>
       </label>
       <label className="block text-[11px] font-medium text-[#53647e]">Submitted to
         <input name="to" type="date" defaultValue={filters.to} className="input-field mt-1 min-h-10 text-xs"/>
       </label>
     </>}
   />
 </AdminShell>;
}
