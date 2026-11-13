import { redirect } from "next/navigation";
import { currentStaff,canManage } from "@/server/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { EnquiryDirectory, type DirectoryRecord } from "@/features/admin/components/enquiry-directory";
import { packageStatusLabels } from "@/features/admin/lib/package-status";
import { loadPackageEnquiries,makePackageFilters,packageEnquiryOptions,packageFilterQuery } from "@/server/package-enquiry-data";
import { packageEnquiryStatuses } from "@/server/package-enquiry-schema";

export async function PackageEnquiriesSection({searchParams}:{
 searchParams:Promise<Record<string,string|string[]|undefined>>;
}){
 const staff=await currentStaff();
 if(!staff)redirect("/admin/login");
 const filters=makePackageFilters(await searchParams);
 let data:Awaited<ReturnType<typeof loadPackageEnquiries>>={rows:[],total:0,pageSize:20};
 let options:Awaited<ReturnType<typeof packageEnquiryOptions>>=[];
 let error="";
 try{[data,options]=await Promise.all([loadPackageEnquiries(filters),packageEnquiryOptions()]);}
 catch{error="Package enquiries are unavailable. Check the database connection.";}
 const active:Record<string,string>={q:filters.q,status:filters.status,package:filters.package,from:filters.from,to:filters.to};
 const rows:DirectoryRecord[]=data.rows.map(item=>({
   id:item.id,href:"/admin/package-enquiries/"+item.id,reference:item.reference,
   name:item.name,email:item.email,detail:item.packageTitle,detailSecondary:item.destination,
   createdAt:item.createdAt,travelDate:item.preferredDate,status:item.status,
   travellers:item.adults+item.children+item.infants,
 }));
 const query=packageFilterQuery(filters,1);
 return <AdminShell user={staff}>
   <EnquiryDirectory
     title="Package enquiries" eyebrow="Package reservations desk"
     description="Manage requests for published tours and travel experiences."
     path="/admin/package-enquiries" rows={rows} total={data.total} page={filters.page} pageSize={20}
     statuses={packageEnquiryStatuses.map(value=>({value,label:packageStatusLabels[value]}))}
     active={active} columns={{detail:"Package",travelDate:"Travel date"}}
     exportHref={canManage(staff)&&!error?"/api/admin/package-enquiries/export"+(query?"?"+query:""):undefined}
     error={error} emptyMessage="No package enquiries match these filters."
     filterFields={<>
       <label className="block text-[11px] font-medium text-[#53647e]">Package
         <select name="package" defaultValue={filters.package} className="input-field mt-1 min-h-10 text-xs">
           <option value="">All packages</option>
           {options.map(item=><option key={item.slug} value={item.slug}>{item.title} ({item.count})</option>)}
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
