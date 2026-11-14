import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentStaff, canManage } from "@/server/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { ReportDashboard } from "@/features/admin/components/reports-dashboard";
import { loadReports, readReportDays } from "@/server/report-data";

export async function ReportsSection({searchParams}:{
  searchParams:Promise<{days?:string|string[]}>;
}){
 const staff=await currentStaff();
 if(!staff)redirect("/admin/login");
 if(!canManage(staff))notFound();
 const params=await searchParams;
 const days=readReportDays(typeof params.days==="string"?params.days:undefined);
 try{
  const report=await loadReports(days);
  return <AdminShell user={staff}><ReportDashboard report={report}/></AdminShell>;
 }catch{
  return <AdminShell user={staff}>
    <div className="rounded-[18px] border border-[#f0d7d4] bg-white p-8">
      <h1 className="text-xl font-medium text-navy">Reports temporarily unavailable</h1>
      <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[#687991]">
        We could not retrieve the current enquiry figures. No estimates are displayed. Check the production database connection and required enquiry tables.
      </p>
      <Link href="/admin" className="mt-6 inline-flex min-h-10 items-center rounded-xl bg-sapphire px-4 text-[12px] font-medium text-white">Return to overview</Link>
    </div>
  </AdminShell>;
 }
}
