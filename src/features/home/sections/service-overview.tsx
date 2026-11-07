import Link from "next/link";
import { ArrowUpRight, PlaneTakeoff, BriefcaseBusiness, FileCheck2, MapPinned } from "lucide-react";
const services=[
 {icon:PlaneTakeoff,title:"Flights, made simple",desc:"Domestic and international flight enquiries, ticketing support and itinerary coordination.",href:"/request?service=flight"},
 {icon:FileCheck2,title:"Visa assistance",desc:"Clear guidance on required documents and application-process support.",href:"/visa-assistance"},
 {icon:BriefcaseBusiness,title:"Business & delegation travel",desc:"Coordinated journeys for meetings, institutions, conferences and professional groups.",href:"/corporate-travel"},
 {icon:MapPinned,title:"Trips worth taking",desc:"Thoughtful personal travel arrangements and destination planning support.",href:"/destinations"}
];
export function ServiceOverview(){return <section className="section-space bg-white"><div className="container-wide"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="eyebrow">What we do</p><h2 className="display-heading mt-4 max-w-[750px] text-[clamp(1.44rem,2.76vw,2.7rem)]">Travel services, shaped<br className="hidden md:block"/> around you.</h2></div><p className="max-w-[350px] text-sm leading-7 text-muted">The details matter. We simplify them so you can focus on what matters most.</p></div>
 <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{services.map((s,i)=><Link key={s.title} href={s.href} className="group surface-card min-h-[285px] p-7 transition-all hover:-translate-y-1 hover:border-[#a9cbff] hover:shadow-xl"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-sapphire"><s.icon size={22} strokeWidth={1.6}/></span><span className="mt-10 block text-[10px] font-semibold tracking-[.2em] text-[#9aa9be]">0{i+1}</span><h3 className="mt-2 text-xl font-semibold tracking-[-.04em] text-navy">{s.title}</h3><p className="mt-4 text-sm leading-6 text-muted">{s.desc}</p><ArrowUpRight size={19} className="mt-6 text-sapphire transition-transform group-hover:translate-x-1"/></Link>)}</div>
 </div></section>}
