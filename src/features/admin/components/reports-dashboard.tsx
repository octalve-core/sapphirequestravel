import Link from "next/link";
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays,
  CircleCheck, Clock3, FileDown, Globe2, Inbox, Layers3,
  MailCheck, PackageCheck, UsersRound, UserRoundSearch,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ReportData, TrendPoint, CategoryCount } from "@/server/report-data";

const n=(value:number)=>value.toLocaleString("en-NG");
const panel="rounded-[18px] border border-[#e3eaf3] bg-white p-5 shadow-[0_4px_18px_rgba(7,28,59,.035)] sm:p-6";
const colors=["bg-[#0755db]","bg-[#5d9ef8]","bg-[#15a6ad]"];
const date=(value:string)=>new Date(value+"T12:00:00Z").toLocaleDateString("en-GB",{month:"short",day:"numeric",timeZone:"UTC"});

function MetricCard({title,value,detail,icon:Icon,accent}:{
 title:string;value:string;detail:string;icon:typeof Inbox;accent:string;
}){
 return <article className="min-w-0 rounded-[18px] border border-[#e3eaf3] bg-white p-4 shadow-[0_4px_15px_rgba(7,28,59,.025)] sm:p-5">
  <div className="flex items-start justify-between gap-3">
   <p className="text-[12px] font-medium leading-5 text-[#5e718d]">{title}</p>
   <span className={"grid size-10 shrink-0 place-items-center rounded-xl "+accent}>
    <Icon size={19} strokeWidth={1.8} aria-hidden="true"/>
   </span>
  </div>
  <p className="mt-5 text-[clamp(1.65rem,2.5vw,2.25rem)] font-medium leading-10 tracking-[-.05em] tabular-nums text-[#092a5b]">{value}</p>
  <p className="mt-1 text-[11px] leading-5 text-[#74839a]">{detail}</p>
 </article>;
}
function PanelHeading({title,description,link}:{
 title:string;description:string;link?:{href:string;label:string};
}){
 return <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
  <div><h2 className="text-[16px] font-medium tracking-[-.035em] text-navy">{title}</h2>
   <p className="mt-1 text-[12px] leading-5 text-[#8291a7]">{description}</p></div>
  {link&&<Link href={link.href} className="inline-flex min-h-9 items-center gap-1.5 text-[11px] font-medium text-sapphire hover:underline">
    {link.label}<ArrowUpRight size={14} aria-hidden="true"/>
   </Link>}
 </div>;
}
function TrendGraph({points,days}: {points:TrendPoint[];days:number}){
 const maximum=Math.max(1,...points.map(x=>x.total));
 const tick=Math.max(1,Math.ceil(points.length/7));
 const labels:[string,string,string]=["General","Packages","Visa"];
 return <div>
  <div aria-label="Chart series" className="mb-5 flex flex-wrap gap-x-5 gap-y-2">
   {labels.map((label,i)=><span key={label} className="inline-flex items-center gap-2 text-[11px] text-[#60738e]">
    <span className={"size-2.5 rounded-sm "+colors[i]}/>{label}
   </span>)}
  </div>
  <figure>
   <div aria-hidden="true" className="relative h-[220px] border-b border-[#dce5f1]">
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-0">
     {[0,1,2,3,4].map(i=><div key={i} className="border-t border-dashed border-[#e9eff7]"/>)}
    </div>
    <div className="relative flex h-full items-end justify-between gap-1.5 px-0.5 pb-0.5 sm:gap-2.5">
     {points.map(point=><div key={point.period} className="group flex h-full min-w-0 flex-1 flex-col justify-end"
        title={date(point.period)+": "+n(point.total)+" enquiries"}>
       <div className="flex min-h-0 w-full flex-col-reverse overflow-hidden rounded-t-[4px] transition-opacity group-hover:opacity-80"
         style={{height:(point.total/maximum*100)+"%"}}>
         {([["general",colors[0]],["packages",colors[1]],["visa",colors[2]]] as const).map(([key,color])=>
          point[key]>0?<div key={key} className={"w-full "+color} style={{height:(point[key]/point.total*100)+"%"}}/>:null)}
       </div>
      </div>)}
    </div>
   </div>
   <div aria-hidden="true" className="mt-2 flex justify-between gap-1 text-[10px] text-[#8999af]">
    {points.filter((_,i)=>i%tick===0||i===points.length-1).map(point=><span key={point.period}>{date(point.period)}</span>)}
   </div>
   <figcaption className="mt-4 text-[11px] leading-5 text-[#8390a4]">
    {days===90?"Weekly":days===365?"Monthly":"Daily"} enquiries created, grouped by source. Date buckets use UTC.
   </figcaption>
   <table className="sr-only">
    <caption>Enquiries by period and source, exact figures</caption>
    <thead><tr><th scope="col">Period</th><th scope="col">General</th><th scope="col">Packages</th><th scope="col">Visa</th><th scope="col">Total</th></tr></thead>
    <tbody>{points.map(x=><tr key={x.period}><th scope="row">{x.period}</th><td>{x.general}</td><td>{x.packages}</td><td>{x.visa}</td><td>{x.total}</td></tr>)}</tbody>
   </table>
  </figure>
 </div>;
}
function RankedList({rows,empty,link}:{
 rows:CategoryCount[];empty:string;link?:string;
}){
 const max=Math.max(1,...rows.map(r=>r.count));
 return <div className="space-y-4">
  {rows.map((row,i)=><div key={row.label+"-"+i} className="min-w-0">
   <div className="mb-1.5 flex items-start justify-between gap-3 text-[12px]">
    <span className="break-words font-medium text-[#31496a]">{row.label}</span>
    <span className="shrink-0 tabular-nums text-[#667993]">{n(row.count)}</span>
   </div>
   <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eef2f7]">
    <div className="h-full rounded-full bg-[#0755db]" style={{width:(row.count/max*100)+"%"}}/>
   </div>
  </div>)}
  {!rows.length&&<p className="rounded-xl bg-[#f7f9fc] px-4 py-7 text-center text-[12px] text-muted">{empty}</p>}
  {link&&<Link className="inline-flex min-h-9 items-center gap-2 text-[11px] font-medium text-sapphire hover:underline" href={link}>Open enquiries<ArrowUpRight size={14} aria-hidden="true"/></Link>}
 </div>;
}
function Delta({current,previous}:{current:number;previous:number}){
 if(previous===0)return <span className="text-[11px] text-[#8390a4]">No prior-period baseline</span>;
 const change=(current-previous)/previous*100;
 const up=change>=0;
 return <span className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium "+(up?"bg-[#edf7ff] text-[#2562ac]":"bg-[#fff2ec] text-[#a55a36]")}>
  {up?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>}
  {Math.abs(change).toFixed(1)}% vs previous {n(previous)} enquiries
 </span>;
}
export function ReportDashboard({report:r}:{report:ReportData}){
 const s=r.summary,open=s.newCount+s.active;
 const formattedTime=new Date(r.asOf).toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",timeZone:"UTC"})+" UTC";
 const kpis:[
  {title:"Enquiries received",value:n(s.total),detail:"All three enquiry systems",icon:Inbox,accent:"bg-[#e8f3ff] text-sapphire"},
  {title:"Contact email addresses",value:n(s.uniqueContacts),detail:"Distinct submitted addresses",icon:UsersRound,accent:"bg-[#f0ebff] text-[#7557c6]"},
  {title:"Awaiting action",value:n(open),detail:"New or in-progress enquiries",icon:Clock3,accent:"bg-[#fff3e7] text-[#c28132]"},
  {title:"Marked confirmed",value:n(s.confirmed),detail:"Staff status, not paid bookings",icon:CircleCheck,accent:"bg-[#e7f8ee] text-[#168255]"},
  {title:"Repeat-contact emails",value:n(s.repeatContactEmails),detail:"Addresses used for 2+ enquiries",icon:UserRoundSearch,accent:"bg-[#e9f3ff] text-[#236bb3]"},
  {title:"Open and unassigned",value:n(s.unassigned),detail:"Requires staff ownership",icon:MailCheck,accent:"bg-[#fff0e8] text-[#be6b39]"},
  {title:"New for over 48 hours",value:n(s.unreviewed48),detail:"Still marked New",icon:Activity,accent:"bg-[#fff0eb] text-[#c05d50]"},
  {title:"Published packages",value:n(r.publishedPackages),detail:n(r.draftPackages)+" draft packages · all time",icon:PackageCheck,accent:"bg-[#ecf7f2] text-[#22825a]"},
 ];
 return <div className="space-y-7">
  <div className="flex flex-wrap items-end justify-between gap-5">
   <div>
    <p className="text-[11px] font-medium uppercase tracking-[.15em] text-sapphire">Operations intelligence</p>
    <h1 className="mt-2 text-[clamp(1.8rem,3.2vw,2.5rem)] font-medium tracking-[-.055em] text-navy">Reports &amp; insights</h1>
    <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#687991]">Track incoming demand, customer contact patterns and team follow-up using real saved enquiry data.</p>
   </div>
   <div className="flex flex-wrap items-center gap-2">
    <a href={"/api/admin/reports/export?days="+r.days} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce6f2] bg-white px-3.5 text-[12px] font-medium text-[#385472] hover:border-sapphire hover:text-sapphire">
     <FileDown size={16} aria-hidden="true"/> Export summary
    </a>
   </div>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3eaf2] bg-white px-4 py-3.5 sm:px-5">
   <nav aria-label="Report period" className="flex flex-wrap gap-2">
    {([7,30,90,365] as const).map(days=><Link key={days} href={"/admin/reports?days="+days}
      aria-current={r.days===days?"page":undefined}
      className={"inline-flex min-h-9 items-center rounded-full px-4 text-[11px] font-medium transition-colors "+(r.days===days?"bg-[#e9f2ff] text-[#0755db]":"bg-[#f1f2f4] text-[#65758d] hover:bg-[#e9effa]")}>
      {days===365?"12 months":days+" days"}
     </Link>)}
   </nav>
   <span className="inline-flex items-center gap-2 text-[11px] text-[#8390a3]"><CalendarDays size={14} aria-hidden="true"/> Updated {formattedTime}</span>
  </div>

  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
   {kpis.map(kpi=><MetricCard key={kpi.title} {...kpi}/>)}
  </div>

  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(310px,.8fr)]">
   <section className={panel} aria-label="Enquiry volume trend">
    <PanelHeading title="Enquiry activity" description="General, Package and Visa enquiry submissions over time"/>
    <div className="mb-5 flex flex-wrap items-end gap-x-4 gap-y-2">
     <span className="text-[31px] font-medium tracking-[-.045em] tabular-nums text-[#0a2855]">{n(s.total)}</span>
     <Delta current={s.total} previous={s.previous}/>
    </div>
    <TrendGraph points={r.trend} days={r.days}/>
   </section>
   <section className={panel} aria-label="Enquiry sources">
    <PanelHeading title="Where enquiries come from" description="Demand by request type, not website traffic"/>
    <RankedList rows={r.sources} empty="No enquiry sources for this period."/>
   </section>
  </div>

  <div className="grid gap-4 lg:grid-cols-3">
   <section className={panel}>
    <PanelHeading title="Most requested packages" description="Packages with the most enquiry submissions"
      link={{href:"/admin/package-enquiries",label:"View requests"}}/>
    <RankedList rows={r.packages.map(x=>({label:x.title,count:x.count}))}
      empty="No package requests for this period."/>
   </section>
   <section className={panel}>
    <PanelHeading title="Visa destinations" description="Countries requested in the dedicated Visa form"
      link={{href:"/admin/visa-enquiries",label:"View visa enquiries"}}/>
    <RankedList rows={r.visaCountries} empty="No visa requests for this period."/>
   </section>
   <section className={panel}>
    <PanelHeading title="Assigned team workload" description="Open requests created in the selected period"/>
    <RankedList rows={r.team.map(x=>({label:x.name,count:x.open}))} empty="No open requests assigned to staff."/>
   </section>
  </div>

  <section className={panel} aria-label="Operational attention">
   <PanelHeading title="Operational attention" description="Practical next actions supported by current request statuses"/>
   <div className="grid gap-3 sm:grid-cols-3">
    {[
     {label:"New enquiries",value:s.newCount,description:"Check requests not yet moved beyond New.",href:"/admin/enquiries?status=new"},
     {label:"Unassigned open requests",value:s.unassigned,description:"Assign an owner across General, Package and Visa queues.",href:"/admin/enquiries"},
     {label:"New for over 48 hours",value:s.unreviewed48,description:"Prioritise older new submissions across the three queues.",href:"/admin/enquiries?status=new"},
    ].map(item=><div key={item.label} className="rounded-xl border border-[#e4eaf3] bg-[#f8faff] p-4">
      <div className="flex items-center justify-between gap-2">
       <span className="text-[12px] font-medium text-[#3d5878]">{item.label}</span>
       <span className="text-[22px] font-medium tabular-nums text-navy">{n(item.value)}</span>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-[#73839a]">{item.description}</p>
      <Link href={item.href} className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-[11px] font-medium text-sapphire hover:underline">
       Open worklist <ArrowUpRight size={13} aria-hidden="true"/>
      </Link>
    </div>)}
   </div>
  </section>

  <div className="rounded-[16px] border border-[#dfe9f4] bg-[#eff5ff] p-4 text-[11px] leading-6 text-[#526987] sm:p-5">
   <p className="flex items-center gap-2 font-medium text-[#173e75]"><Layers3 size={16} aria-hidden="true"/> How to read this report</p>
   <p className="mt-2">All counts except the published/draft package catalogue refer to enquiries submitted during the selected rolling period. Contact counts use case-insensitive email addresses; repeated emails are not proof of the same person or completed travel. Team workload is based on currently assigned, not-confirmed/not-closed requests created in the period. New for over 48 hours means the request is still marked New; it is not a measured response-time SLA. Confirmed means the staff-selected status, not a paid booking, flight ticket or approved visa. This system does not currently hold verified revenue, profit or supplier-cost records.</p>
  </div>
 </div>;
}
