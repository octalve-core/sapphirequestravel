import { NextRequest, NextResponse } from "next/server";
import { currentStaff, canManage } from "@/server/auth";
import { loadReports, readReportDays } from "@/server/report-data";
import { excelCsvRow } from "@/server/excel-csv";
export const runtime="nodejs";

export async function GET(req:NextRequest){
 const staff=await currentStaff();
 if(!staff)return NextResponse.json({error:"Authentication required"},{status:401,headers:{"Cache-Control":"no-store"}});
 if(!canManage(staff))return NextResponse.json({error:"Not permitted"},{status:403,headers:{"Cache-Control":"no-store"}});
 const days=readReportDays(req.nextUrl.searchParams.get("days"));
 try{
  const report=await loadReports(days);
  const s=report.summary;
  const rows=[
   ["Sapphire Quest","Reports & Insights","Enquiry activity (not revenue)"],
   ["Window",days+" days","Rolling, UTC"],
   ["Generated",report.asOf,"UTC"],
   [],
   ["Metric","Value","Meaning"],
   ["Enquiries received",s.total,"All three enquiry systems, selected window"],
   ["Previous period",s.previous,"Equal-length preceding window"],
   ["Distinct contact emails",s.uniqueContacts,"Lowercased email addresses, not verified unique people"],
   ["Repeat-contact emails",s.repeatContactEmails,"Contact email appeared in 2+ enquiries"],
   ["New",s.newCount,"Status New for enquiries created in window"],
   ["Active",s.active,"Statuses Reviewing, Contacted, Quoted, Awaiting customer or Follow-up"],
   ["Marked confirmed",s.confirmed,"Staff status, not verified paid booking or visa"],
   ["Closed",s.closed,"Staff status"],
   ["Open and unassigned",s.unassigned,"Unassigned, not Confirmed or Closed"],
   ["New over 48 hours",s.unreviewed48,"Still status New; not a measured response SLA"],
   ["Published packages",report.publishedPackages,"Catalogue total, all time"],
   ["Draft packages",report.draftPackages,"Catalogue total, all time"],
   [],
   ["Period (UTC)","General","Package enquiries","Visa assistance","Total"],
   ...report.trend.map(x=>[x.period,x.general,x.packages,x.visa,x.total]),
   [],
   ["Enquiry source","Count"],
   ...report.sources.map(x=>[x.label,x.count]),
   [],
   ["Popular package","Enquiries","Package slug"],
   ...report.packages.map(x=>[x.title,x.count,x.slug]),
   [],
   ["Visa country","Enquiries"],
   ...report.visaCountries.map(x=>[x.label,x.count]),
   [],
   ["Staff member","Open assigned enquiries"],
   ...report.team.map(x=>[x.name,x.open]),
  ];
  const body="\uFEFF"+rows.map((row,i)=>excelCsvRow(row,i<3?[0]:[])).join("\r\n")+"\r\n";
  return new NextResponse(body,{headers:{
   "Content-Type":"text/csv; charset=utf-8",
   "Content-Disposition":'attachment; filename="sapphire-quest-enquiry-insights-'+days+'d.csv"',
   "Cache-Control":"private, no-store",
   "X-Content-Type-Options":"nosniff",
  }});
 }catch{
  return NextResponse.json({error:"Reporting data could not be generated."},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}
