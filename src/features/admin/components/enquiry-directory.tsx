import type { ReactNode } from "react";
import Link from "next/link";
import { Download, FileText, MoreVertical, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export type DirectoryStatus={value:string;label:string};
export type DirectoryRecord={
 id:string;href:string;reference:string;name:string;email:string;
 detail:string;detailSecondary?:string;travelDate?:string|null;
 createdAt:string;status:string;travellers?:number;
};
export type DirectoryFilters=Record<string,string>;
type Props={
 title:string;description:string;eyebrow:string;path:string;
 rows:DirectoryRecord[];total:number;page:number;pageSize:number;
 statuses:DirectoryStatus[];active:DirectoryFilters;
 filterFields:ReactNode;columns:{detail:string;travelDate:string};
 exportHref?:string;error?:string;emptyMessage:string;
};
const colour:Record<string,{icon:string;badge:string}>={
 new:{icon:"bg-[#e8f2ff] text-[#0061de]",badge:"bg-[#e8f2ff] text-[#0755db]"},
 reviewing:{icon:"bg-[#fff5e2] text-[#e79300]",badge:"bg-[#fff7e6] text-[#ac710b]"},
 contacted:{icon:"bg-[#fff5e2] text-[#e79300]",badge:"bg-[#fff7e6] text-[#ac710b]"},
 quoted:{icon:"bg-[#f1eaff] text-[#8658d5]",badge:"bg-[#f1eaff] text-[#7650b7]"},
 awaiting_customer:{icon:"bg-[#ffede4] text-[#e77431]",badge:"bg-[#fff0e5] text-[#ba6324]"},
 follow_up:{icon:"bg-[#ffede4] text-[#e77431]",badge:"bg-[#fff0e5] text-[#ba6324]"},
 confirmed:{icon:"bg-[#dcfae8] text-[#07934b]",badge:"bg-[#dcfae8] text-[#067a3d]"},
 closed:{icon:"bg-[#f0f2f5] text-[#64748b]",badge:"bg-[#edf0f4] text-[#566579]"},
};
const fallback={icon:"bg-[#eef2f7] text-[#58718f]",badge:"bg-[#eef2f7] text-[#58718f]"};
function date(value?:string|null):string{
 if(!value)return "—";
 const d=/^\d{4}-\d{2}-\d{2}$/.test(value)?new Date(value+"T12:00:00Z"):new Date(value);
 return Number.isNaN(d.getTime())?"—":d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"});
}
function url(path:string,active:DirectoryFilters,changes:Record<string,string>):string{
 const query=new URLSearchParams(active);
 for(const [key,value] of Object.entries(changes)) {
   if(value && value!=="all")query.set(key,value);
   else query.delete(key);
 }
 const params=query.toString();
 return path+(params?"?"+params:"");
}
function statusName(value:string,statuses:DirectoryStatus[]){
 return statuses.find(s=>s.value===value)?.label || value.replaceAll("_"," ");
}
function Status({value,statuses}:{value:string;statuses:DirectoryStatus[]}){
 return <span className={"inline-flex min-h-[24px] items-center rounded-lg px-2.5 py-1 text-[11px] font-medium whitespace-nowrap "+(colour[value]||fallback).badge}>{statusName(value,statuses)}</span>;
}
function DocumentIcon({status}:{status:string}){
 return <span className={"inline-flex size-[42px] shrink-0 items-center justify-center rounded-full "+(colour[status]||fallback).icon}><FileText size={19} strokeWidth={1.8} aria-hidden="true"/></span>;
}

/** One server-rendered design system for General, Package and Visa enquiries.
 * A semantic desktop table becomes compact mobile cards without horizontal scrolling.
 * Search, filters, status tabs, export and pagination retain server-side URL state.
 */
export function EnquiryDirectory({title,description,eyebrow,path,rows,total,page,pageSize,statuses,active,filterFields,columns,exportHref,error,emptyMessage}:Props){
 const activeStatus=active.status||"all";
 const totalPages=Math.max(1,Math.ceil(total/pageSize));
 const safePage=Math.min(page,totalPages);
 const label=title.toLowerCase();
 return <div>
   <div className="mb-7">
     <p className="text-[11px] font-medium uppercase tracking-[.15em] text-sapphire">{eyebrow}</p>
     <h1 className="mt-2 text-[clamp(1.55rem,2.8vw,2.25rem)] font-medium tracking-[-.05em] text-navy">{title}</h1>
     <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#64738c]">{description}</p>
   </div>
   {error&&<p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-900">{error}</p>}
   <section aria-label={title+" directory"} className="overflow-visible rounded-[18px] border border-[#e6e9ee] bg-white shadow-[0_2px_5px_rgba(7,28,59,.05)]">
     <nav aria-label={title+" status filters"} className="flex flex-wrap gap-2.5 border-b border-[#e7eaf0] px-4 py-5 sm:px-6">
       {[{value:"all",label:"All"},...statuses].map(item=>
         <Link key={item.value} href={url(path,active,{status:item.value,page:""})}
           aria-current={activeStatus===item.value?"page":undefined}
           className={"inline-flex min-h-[34px] items-center justify-center rounded-full px-4 py-2 text-[11px] font-medium transition-colors "+(activeStatus===item.value?"bg-[#ecf4ff] text-[#0755db]":"bg-[#f1f1f3] text-[#637189] hover:bg-[#e8eef9] hover:text-sapphire")}>
           {item.label}
         </Link>)}
     </nav>
     <div className="flex flex-col gap-3 border-b border-[#edf0f4] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
       <p className="shrink-0 text-[12px] font-medium text-[#344967]">{total.toLocaleString("en-NG")} {total===1?"enquiry":"enquiries"}</p>
       <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-end">
         <form method="GET" action={path} role="search" className="flex min-w-0 flex-1 flex-wrap items-start gap-2 sm:flex-initial">
           {activeStatus!=="all"&&<input type="hidden" name="status" value={activeStatus}/>}
           <div className="relative min-w-[145px] flex-1 sm:w-[250px] sm:flex-none">
             <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-[12px] text-[#899ab0]"/>
             <input name="q" aria-label={"Search "+label} maxLength={100} defaultValue={active.q||""}
               placeholder="Search" className="h-[40px] w-full min-w-0 rounded-xl border border-[#e1e6ee] bg-white pl-10 pr-3 text-[12px] text-navy placeholder:text-[#96a3b5] focus:border-sapphire focus:outline-2 focus:outline-[#cce2ff]"/>
           </div>
           <details className="group relative shrink-0">
             <summary className="flex h-[40px] cursor-pointer list-none items-center gap-2 rounded-xl border border-[#e0e6ef] bg-white px-3 text-[12px] font-medium text-[#455773] marker:hidden hover:bg-[#f8faff] [&::-webkit-details-marker]:hidden">
               <SlidersHorizontal size={16} aria-hidden="true"/> Filters
             </summary>
             <div className="absolute right-0 z-20 mt-2 w-[min(82vw,335px)] rounded-2xl border border-[#dfe6f0] bg-white p-4 shadow-[0_20px_55px_rgba(7,28,59,.14)]">
               <p className="mb-3 text-[12px] font-medium text-navy">Refine {label}</p>
               <div className="space-y-3">{filterFields}</div>
               <div className="mt-4 flex items-center justify-between gap-2">
                 <Link href={url(path,{}, {status:activeStatus})} className="text-[11px] font-medium text-[#68778e] hover:text-sapphire">Clear</Link>
                 <button type="submit" className="min-h-10 rounded-lg bg-sapphire px-4 text-[12px] font-medium text-white">Apply filters</button>
               </div>
             </div>
           </details>
           <button type="submit" className="inline-flex h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-sapphire px-3.5 text-[12px] font-medium text-white hover:bg-[#0348b8]">
             <Search size={14} aria-hidden="true"/>Search
           </button>
         </form>
         {exportHref&&<a href={exportHref} className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-[#e0e6ef] px-3.5 text-[12px] font-medium text-[#42536d] hover:border-sapphire hover:text-sapphire">
           <Download size={15} aria-hidden="true"/> Export
         </a>}
       </div>
     </div>
     {/* The full semantic grid is kept for desktops, while mobile uses the same data as cards. */}
     <div className="hidden overflow-x-auto px-3 pb-3 pt-2 xl:block">
       <table className="w-full min-w-[930px] border-separate border-spacing-y-2 text-left text-[12px] text-[#53647e]">
         <caption className="sr-only">{title}. Showing {rows.length} of {total} matching enquiries.</caption>
         <thead><tr className="bg-[#f2f3f6] text-[11px] text-[#728099]">
           {["","Reference","Customer",columns.detail,columns.travelDate,"Received","Email","Status",""].map((head,i)=>
             <th key={i} scope="col" className="whitespace-nowrap px-3 py-3 font-medium first:rounded-l-lg last:rounded-r-lg">{head||<span className="sr-only">{i===0?"Type":"Open"}</span>}</th>)}
         </tr></thead>
         <tbody>
           {rows.map(item=><tr key={item.id} className="bg-[#f8f8f9] transition-colors hover:bg-[#f0f5fd]">
             <td className="rounded-l-xl px-3 py-2"><DocumentIcon status={item.status}/></td>
             <th scope="row" className="max-w-[155px] break-all px-3 py-3 text-left text-[12px] font-medium text-sapphire"><Link href={item.href} className="hover:underline">{item.reference}</Link></th>
             <td className="max-w-[180px] px-3 py-3 font-medium text-navy"><span className="break-words">{item.name}</span></td>
             <td className="max-w-[230px] px-3 py-3"><p className="break-words text-[12px] text-[#344967]">{item.detail}</p>{item.detailSecondary&&<p className="mt-1 truncate text-[10px] text-[#8996a8]">{item.detailSecondary}</p>}</td>
             <td className="whitespace-nowrap px-3 py-3">{date(item.travelDate)}</td>
             <td className="whitespace-nowrap px-3 py-3">{date(item.createdAt)}</td>
             <td className="max-w-[190px] truncate px-3 py-3 text-[11px]">{item.email}</td>
             <td className="px-3 py-3"><Status value={item.status} statuses={statuses}/></td>
             <td className="rounded-r-xl px-3 py-3"><Link href={item.href} aria-label={"Open enquiry "+item.reference} className="inline-flex size-9 items-center justify-center rounded-lg text-[#7d8ca1] hover:bg-white hover:text-sapphire"><MoreVertical size={17} aria-hidden="true"/></Link></td>
           </tr>)}
         </tbody>
       </table>
     </div>
     <div className="grid gap-2.5 px-3 py-3 xl:hidden">
       {rows.map(item=><Link key={item.id} href={item.href} aria-label={"Open "+item.reference+" for "+item.name}
         className="flex min-h-[105px] min-w-0 items-center gap-3 rounded-[15px] bg-[#f8f8f9] px-3 py-3 transition-colors hover:bg-[#f0f5fd] focus-visible:outline-2 focus-visible:outline-sapphire">
         <DocumentIcon status={item.status}/>
         <div className="min-w-0 flex-1">
           <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
             <p className="min-w-0 break-words text-[12px] font-medium text-[#0b294e]">{item.name}</p>
             <Status value={item.status} statuses={statuses}/>
           </div>
           <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
             <span className="max-w-full break-all rounded-full bg-white px-2 py-1 text-[10px] text-[#71819b]">{item.reference}</span>
             <span className="truncate text-[11px] text-[#52647d]">{item.detail}</span>
           </div>
           <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#8897a9]">
             <span>Created: {date(item.createdAt)}</span>
             <span>{columns.travelDate}: {date(item.travelDate)}</span>
           </div>
         </div>
         <MoreVertical size={17} aria-hidden="true" className="shrink-0 text-[#91a0b3]"/>
       </Link>)}
     </div>
     {!rows.length&&<p className="px-6 py-14 text-center text-[13px] text-muted">{emptyMessage}</p>}
     <div className="flex items-center justify-between gap-2 border-t border-[#e9edf3] px-4 py-4 sm:px-6">
       <Link href={url(path,active,{page:String(Math.max(1,page-1))})}
         aria-disabled={page<=1} tabIndex={page<=1?-1:undefined}
         className={"inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#e3e7ef] px-3 text-[12px] "+(page<=1?"pointer-events-none text-[#b4bdca]":"text-[#586d89] hover:text-sapphire")}>
         <ChevronLeft size={14}/> Previous
       </Link>
       <p className="text-[11px] tabular-nums text-[#6b7a93]">Page {safePage} of {totalPages}</p>
       <Link href={url(path,active,{page:String(page+1)})}
         aria-disabled={page>=totalPages} tabIndex={page>=totalPages?-1:undefined}
         className={"inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#e3e7ef] px-3 text-[12px] "+(page>=totalPages?"pointer-events-none text-[#b4bdca]":"text-[#586d89] hover:text-sapphire")}>
         Next <ChevronRight size={14}/>
       </Link>
     </div>
   </section>
 </div>;
}
