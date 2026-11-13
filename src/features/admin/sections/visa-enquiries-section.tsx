import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { currentStaff, canManage } from "@/server/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { packageStatusLabels,packageStatusClasses } from "@/features/admin/lib/package-status";
import { countries } from "@/data/countries";
import { visaTypes,visaStatusValues } from "@/server/visa-enquiry-schema";
import { readVisaFilters,visaFilterQuery,visaEnquiryList,visaMetrics } from "@/server/visa-enquiry-data";

export async function VisaEnquiriesSection({searchParams}:{
  searchParams:Promise<Record<string,string|string[]|undefined>>;
}){
  const staff=await currentStaff();
  if(!staff)redirect("/admin/login");
  const filters=readVisaFilters(await searchParams);
  let data:Awaited<ReturnType<typeof visaEnquiryList>>={rows:[],total:0};
  let metrics={total:0,newCount:0,inProgress:0};
  let error="";
  try{[data,metrics]=await Promise.all([visaEnquiryList(filters),visaMetrics()]);}
  catch{error="Unable to load visa enquiries. Please verify the database connection and visa migration.";}
  const pages=Math.max(1,Math.ceil(data.total/20));
  const query=visaFilterQuery(filters,1);
  return <AdminShell user={staff}>
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">Visa operations</p>
        <h1 className="display-heading mt-3 text-3xl text-navy">Visa enquiries</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Manage visa requests separately from flights, corporate journeys and package bookings.</p>
      </div>
      {canManage(staff)&&!error&&<a href={"/api/admin/visa-enquiries/export"+(query?"?"+query:"")}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-sapphire px-5 text-[12px] font-medium text-white">
        <Download size={16}/> Export for Excel (CSV)
      </a>}
    </div>
    {error&&<p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error}</p>}
    <div className="mb-6 grid gap-4 sm:grid-cols-3">
      {([["All visa enquiries",metrics.total],["New requests",metrics.newCount],["In progress",metrics.inProgress]] as const).map(([label,n])=>
        <div className="rounded-2xl border border-[#e5eaf2] bg-white p-5" key={label}>
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-2 text-3xl font-medium tabular-nums text-navy">{n.toLocaleString("en-NG")}</p>
        </div>)}
    </div>
    <form method="GET" action="/admin/visa-enquiries" className="mb-6 grid gap-3 rounded-2xl border border-[#e4eaf3] bg-white p-5 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_auto]">
      <label className="text-[11px] font-medium text-muted">Search
        <input name="q" defaultValue={filters.q} className="input-field mt-1" maxLength={100} placeholder="Name, reference, email or city"/>
      </label>
      <label className="text-[11px] font-medium text-muted">Status
        <select name="status" defaultValue={filters.status} className="input-field mt-1">
          <option value="all">All statuses</option>
          {visaStatusValues.map(s=><option key={s} value={s}>{packageStatusLabels[s]}</option>)}
        </select>
      </label>
      <label className="text-[11px] font-medium text-muted">Country
        <select name="country" defaultValue={filters.country} className="input-field mt-1">
          <option value="">All countries</option>
          {countries.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
      </label>
      <label className="text-[11px] font-medium text-muted">Visa type
        <select name="type" defaultValue={filters.type} className="input-field mt-1">
          <option value="">All types</option>
          {visaTypes.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      <label className="text-[11px] font-medium text-muted">Submitted from
        <input name="from" type="date" defaultValue={filters.from} className="input-field mt-1"/>
      </label>
      <label className="text-[11px] font-medium text-muted">Submitted to
        <input name="to" type="date" defaultValue={filters.to} className="input-field mt-1"/>
      </label>
      <div className="flex items-end gap-2">
        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-lg bg-sapphire px-4 text-xs font-medium text-white"><Search size={14}/> Apply</button>
        <Link href="/admin/visa-enquiries" className="inline-flex h-11 items-center rounded-lg border border-[#dce6f1] px-3 text-xs text-muted">Clear</Link>
      </div>
    </form>
    <div className="overflow-hidden rounded-2xl border border-[#e4eaf3] bg-white">
      <div className="flex justify-between gap-4 border-b border-[#e9edf4] px-5 py-4">
        <h2 className="text-sm font-medium text-navy">Visa requests</h2>
        <p className="text-xs text-muted">{data.total.toLocaleString("en-NG")} matching</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[12px]">
          <thead className="bg-[#f8faff] text-[11px] text-[#53637c]"><tr>
            {["Reference","Customer","Destination","Visa type","Purpose","Travel date","Travellers","Status","Submitted",""].map(s=>
              <th key={s||"action"} className="whitespace-nowrap px-4 py-4 font-medium">{s}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-[#edf1f6]">
            {data.rows.map(row=><tr key={row.id} className="hover:bg-[#fbfcff]">
              <td className="px-4 py-4 font-medium text-sapphire">{row.reference}</td>
              <td className="px-4 py-4"><p className="font-medium text-navy">{row.name}</p><p className="mt-1 text-[11px] text-muted">{row.email}</p></td>
              <td className="px-4 py-4 text-navy">{row.city}, {row.countryName}</td>
              <td className="px-4 py-4 capitalize">{visaTypes.find(v=>v.value===row.visaType)?.label||row.visaType}</td>
              <td className="px-4 py-4 capitalize">{row.travelPurpose.replaceAll("-"," ")}</td>
              <td className="whitespace-nowrap px-4 py-4">{row.intendedDate}</td>
              <td className="px-4 py-4 tabular-nums">{row.travellers}</td>
              <td className="px-4 py-4"><span className={"rounded-full px-3 py-1.5 text-[11px] font-medium "+packageStatusClasses[row.status]}>{packageStatusLabels[row.status]}</span></td>
              <td className="whitespace-nowrap px-4 py-4 text-muted">{new Date(row.createdAt).toLocaleDateString("en-NG")}</td>
              <td className="px-4 py-4"><Link href={"/admin/visa-enquiries/"+row.id} className="inline-flex items-center gap-1 text-xs font-medium text-sapphire">Open <ArrowUpRight size={14}/></Link></td>
            </tr>)}
            {!data.rows.length&&<tr><td colSpan={10} className="py-14 text-center text-sm text-muted">No visa requests match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
    <div className="mt-5 flex items-center justify-between gap-4 text-xs text-muted">
      <p>Page {Math.min(filters.page,pages)} of {pages}</p>
      <div className="flex gap-3">
        {filters.page>1&&<Link href={"/admin/visa-enquiries?"+visaFilterQuery(filters,filters.page-1)} className="inline-flex items-center gap-1 text-sapphire"><ChevronLeft size={14}/> Previous</Link>}
        {filters.page<pages&&<Link href={"/admin/visa-enquiries?"+visaFilterQuery(filters,filters.page+1)} className="inline-flex items-center gap-1 text-sapphire">Next <ChevronRight size={14}/></Link>}
      </div>
    </div>
  </AdminShell>;
}
