import { redirect } from "next/navigation";
import { currentStaff,canManage } from "@/server/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { EnquiryDirectory, type DirectoryRecord } from "@/features/admin/components/enquiry-directory";
import { packageStatusLabels } from "@/features/admin/lib/package-status";
import { countries } from "@/data/countries";
import { visaTypes } from "@/data/visa-options";
import { visaStatusValues } from "@/server/visa-enquiry-schema";
import { readVisaFilters,visaFilterQuery,visaEnquiryList } from "@/server/visa-enquiry-data";

export async function VisaEnquiriesSection({searchParams}:{
 searchParams:Promise<Record<string,string|string[]|undefined>>;
}){
 const staff=await currentStaff();
 if(!staff)redirect("/admin/login");
 const filters=readVisaFilters(await searchParams);
 let data:Awaited<ReturnType<typeof visaEnquiryList>>={rows:[],total:0};
 let error="";
 try{data=await visaEnquiryList(filters);}
 catch{error="Visa enquiries are unavailable. Check the database connection.";}
 const active:Record<string,string>={
   q:filters.q,status:filters.status,country:filters.country,type:filters.type,from:filters.from,to:filters.to,
 };
 const rows:DirectoryRecord[]=data.rows.map(item=>({
   id:item.id,href:"/admin/visa-enquiries/"+item.id,reference:item.reference,
   name:item.name,email:item.email,detail:item.city+", "+item.countryName,
   detailSecondary:visaTypes.find(v=>v.value===item.visaType)?.label||item.visaType,
   travelDate:item.intendedDate,createdAt:item.createdAt,status:item.status,travellers:item.travellers,
 }));
 const query=visaFilterQuery(filters,1);
 return <AdminShell user={staff}>
   <EnquiryDirectory
     title="Visa enquiries" eyebrow="Visa operations"
     description="Review visa assistance requests separately from flight and package enquiries. Legacy requests remain in General Enquiries."
     path="/admin/visa-enquiries" rows={rows} total={data.total} page={filters.page} pageSize={20}
     statuses={visaStatusValues.map(value=>({value,label:packageStatusLabels[value]}))}
     active={active} columns={{detail:"Country / city",travelDate:"Intended date"}}
     exportHref={canManage(staff)&&!error?"/api/admin/visa-enquiries/export"+(query?"?"+query:""):undefined}
     error={error} emptyMessage="No visa enquiries match these filters."
     filterFields={<>
       <label className="block text-[11px] font-medium text-[#53647e]">Country
         <select name="country" defaultValue={filters.country} className="input-field mt-1 min-h-10 text-xs">
           <option value="">All countries</option>
           {countries.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}
         </select>
       </label>
       <label className="block text-[11px] font-medium text-[#53647e]">Visa type
         <select name="type" defaultValue={filters.type} className="input-field mt-1 min-h-10 text-xs">
           <option value="">All visa types</option>
           {visaTypes.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
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
