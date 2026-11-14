import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Clock3, Inbox, MailCheck, TrendingUp } from "lucide-react";
import { currentStaff } from "@/server/auth";
import { adminMetrics, recentEnquiries } from "@/server/admin-data";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { EnquiryTable } from "@/features/admin/components/enquiry-table";

const metrics=[
 {key:"total" as const,label:"General enquiries",icon:Inbox,style:"bg-[#e9f3ff] text-sapphire"},
 {key:"newCount" as const,label:"New requests",icon:MailCheck,style:"bg-[#e9f5ff] text-[#257bc4]"},
 {key:"inProgress" as const,label:"In progress",icon:Clock3,style:"bg-[#fff4e7] text-[#ad711e]"},
 {key:"lastWeek" as const,label:"Last 7 days",icon:TrendingUp,style:"bg-[#e6f8ef] text-[#13805c]"},
];

export async function AdminOverviewSection(){
 const user=await currentStaff();
 if(!user)redirect("/admin/login");
 let stats={total:0,newCount:0,inProgress:0,lastWeek:0};
 let enquiries:Awaited<ReturnType<typeof recentEnquiries>>=[];
 let error=false;
 try{
   [stats,enquiries]=await Promise.all([adminMetrics(),recentEnquiries(7)]);
 }catch{error=true;}
 return <AdminShell user={user}>
   <div className="mb-8">
     <p className="text-[11px] font-medium uppercase tracking-[.15em] text-sapphire">Workspace overview</p>
     <h1 className="mt-3 text-[clamp(1.65rem,3.2vw,2.45rem)] font-medium tracking-[-.055em] text-navy">Your operations, at a glance.</h1>
     <p className="mt-2 text-[13px] leading-6 text-[#68768e]">Incoming general travel requests and ongoing conversations, all in one place.</p>
   </div>
   {error&&<p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-800">The database is unavailable. These figures and recent enquiries could not be loaded.</p>}
   <div className="mb-9 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
     {metrics.map(item=>{
       const Icon=item.icon;
       return <div className="rounded-[18px] border border-[#e5eaf1] bg-white p-4 shadow-[0_3px_15px_rgba(7,28,59,.025)] sm:p-5" key={item.key}>
         <div className="flex items-start justify-between gap-3">
           <p className="text-[11px] leading-5 font-medium text-[#68778f] sm:text-[12px]">{item.label}</p>
           <span className={"grid size-9 shrink-0 place-items-center rounded-xl "+item.style}><Icon size={17} aria-hidden="true" strokeWidth={1.8}/></span>
         </div>
         <p className="mt-5 text-[clamp(1.6rem,2.7vw,2.25rem)] font-medium tracking-[-.05em] tabular-nums text-[#0a2352]">{error?"—":stats[item.key].toLocaleString("en-NG")}</p>
       </div>;
     })}
   </div>

   <section className="overflow-hidden rounded-[18px] border border-[#e5e9ef] bg-white shadow-[0_3px_15px_rgba(7,28,59,.035)]" aria-labelledby="recent-enquiries-title">
     <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f4] px-4 py-5 sm:px-6">
       <div>
         <h2 id="recent-enquiries-title" className="text-[16px] font-medium tracking-[-.03em] text-navy">Recent enquiries</h2>
         <p className="mt-1 text-[11px] leading-5 text-[#75839a]">Latest general travel requests · {enquiries.length} shown</p>
       </div>
       <Link href="/admin/enquiries" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dbe5f3] px-3.5 text-[12px] font-medium text-sapphire transition-colors hover:bg-[#f0f6ff]">
         View all <ArrowUpRight size={15} aria-hidden="true"/>
       </Link>
     </div>
     <EnquiryTable rows={enquiries}/>
   </section>
 </AdminShell>;
}
