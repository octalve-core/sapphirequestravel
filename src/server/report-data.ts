import "server-only";
import { db } from "@/server/db";

import { bucketForDays,fillReportTrend } from "@/features/admin/lib/report-math";
import type { ReportDays,TrendPoint } from "@/features/admin/lib/report-math";
export { readReportDays,bucketForDays,fillReportTrend } from "@/features/admin/lib/report-math";
export type { ReportDays,TrendPoint } from "@/features/admin/lib/report-math";
export type CategoryCount={label:string;count:number};
export type PackageInterest={title:string;slug:string;count:number};
export type TeamLoad={name:string;open:number};
export type Summary={
 total:number;previous:number;uniqueContacts:number;repeatContactEmails:number;
 newCount:number;active:number;confirmed:number;closed:number;
 unassigned:number;unreviewed48:number;
};
export type ReportData={
 days:ReportDays;asOf:string;summary:Summary;trend:TrendPoint[];
 sources:CategoryCount[];packages:PackageInterest[];visaCountries:CategoryCount[];
 team:TeamLoad[];publishedPackages:number;draftPackages:number;
};
const n=(value:unknown)=>Number(value)||0;

/** Only persistently saved enquiries are counted. No payment or booking-success claims. */
export async function loadReports(days:ReportDays):Promise<ReportData>{
 const sql=db();
 const unit=bucketForDays(days);
 const [summaryRows,sourceRows,trendRows,packageRows,visaRows,teamRows,catalogRows]=await Promise.all([
  sql`WITH requests AS (
   SELECT lower(btrim(email)) AS contact,status,created_at,assigned_to FROM enquiries
   UNION ALL SELECT lower(btrim(email)),status,created_at,assigned_to FROM package_enquiries
   UNION ALL SELECT lower(btrim(email)),status,created_at,assigned_to FROM visa_enquiries
  )
  SELECT count(*) FILTER(WHERE created_at>=now()-${days}*interval '1 day')::int AS total,
   count(*) FILTER(WHERE created_at>=now()-${days*2}*interval '1 day'
      AND created_at<now()-${days}*interval '1 day')::int AS previous,
   count(DISTINCT nullif(contact,'')) FILTER(WHERE created_at>=now()-${days}*interval '1 day')::int AS "uniqueContacts",
   count(*) FILTER(WHERE created_at>=now()-${days}*interval '1 day' AND status='new')::int AS "newCount",
   count(*) FILTER(WHERE created_at>=now()-${days}*interval '1 day'
      AND status IN ('reviewing','contacted','quoted','awaiting_customer','follow_up'))::int AS active,
   count(*) FILTER(WHERE created_at>=now()-${days}*interval '1 day' AND status='confirmed')::int AS confirmed,
   count(*) FILTER(WHERE created_at>=now()-${days}*interval '1 day' AND status='closed')::int AS closed,
   count(*) FILTER(WHERE created_at>=now()-${days}*interval '1 day'
      AND assigned_to IS NULL AND status NOT IN ('confirmed','closed'))::int AS unassigned,
   count(*) FILTER(WHERE created_at>=now()-${days}*interval '1 day'
      AND status='new' AND created_at<now()-interval '48 hours')::int AS "unreviewed48",
   (SELECT count(*)::int FROM (
     SELECT contact FROM requests WHERE created_at>=now()-${days}*interval '1 day'
       AND contact<>'' GROUP BY contact HAVING count(*)>1
   ) repeat_contacts) AS "repeatContactEmails"
  FROM requests`,
  sql`WITH sources AS (
   SELECT CASE service WHEN 'flight' THEN 'Flight enquiries'
    WHEN 'corporate' THEN 'Corporate travel' WHEN 'visa' THEN 'Legacy visa requests'
    WHEN 'holiday' THEN 'Legacy tour requests' ELSE 'Other general requests' END AS label,created_at
   FROM enquiries
   UNION ALL SELECT 'Package enquiries',created_at FROM package_enquiries
   UNION ALL SELECT 'Visa assistance',created_at FROM visa_enquiries
  )
  SELECT label,count(*)::int AS count FROM sources
  WHERE created_at>=now()-${days}*interval '1 day'
  GROUP BY label ORDER BY count DESC,label ASC`,
  sql`WITH requests AS (
   SELECT 'General' AS source,created_at FROM enquiries
   UNION ALL SELECT 'Packages',created_at FROM package_enquiries
   UNION ALL SELECT 'Visa',created_at FROM visa_enquiries
  )
  SELECT date_trunc(${unit},created_at AT TIME ZONE 'UTC')::date::text AS period,
   source,count(*)::int AS total
  FROM requests WHERE created_at>=now()-${days}*interval '1 day'
  GROUP BY period,source ORDER BY period ASC,source`,
  sql`SELECT package_slug AS slug,max(package_title) AS title,count(*)::int AS count
   FROM package_enquiries WHERE created_at>=now()-${days}*interval '1 day'
   GROUP BY package_slug ORDER BY count DESC,title ASC LIMIT 6`,
  sql`SELECT country_name AS label,count(*)::int AS count
   FROM visa_enquiries WHERE created_at>=now()-${days}*interval '1 day'
   GROUP BY country_name ORDER BY count DESC,label ASC LIMIT 6`,
  sql`WITH requests AS (
   SELECT assigned_to,status,created_at FROM enquiries
   UNION ALL SELECT assigned_to,status,created_at FROM package_enquiries
   UNION ALL SELECT assigned_to,status,created_at FROM visa_enquiries
  )
  SELECT u.name,count(*)::int AS open FROM requests r
   JOIN staff_users u ON u.id=r.assigned_to AND u.active=true
   WHERE r.created_at>=now()-${days}*interval '1 day'
     AND r.status NOT IN ('confirmed','closed')
   GROUP BY u.id,u.name ORDER BY open DESC,u.name LIMIT 6`,
  sql`SELECT count(*) FILTER(WHERE status='published')::int AS published,
   count(*) FILTER(WHERE status='draft')::int AS draft FROM travel_packages`,
 ]);
 const value=summaryRows[0]||{};
 const summary:Summary={
  total:n(value.total),previous:n(value.previous),uniqueContacts:n(value.uniqueContacts),
  repeatContactEmails:n(value.repeatContactEmails),newCount:n(value.newCount),active:n(value.active),
  confirmed:n(value.confirmed),closed:n(value.closed),
  unassigned:n(value.unassigned),unreviewed48:n(value.unreviewed48),
 };
 const asOf=new Date().toISOString();
 return {
  days,asOf,summary,
  sources:sourceRows.map(row=>({label:String(row.label),count:n(row.count)})),
  trend:fillReportTrend(trendRows.map(row=>({period:String(row.period),source:String(row.source),total:n(row.total)})),days,asOf),
  packages:packageRows.map(row=>({slug:String(row.slug),title:String(row.title),count:n(row.count)})),
  visaCountries:visaRows.map(row=>({label:String(row.label),count:n(row.count)})),
  team:teamRows.map(row=>({name:String(row.name),open:n(row.open)})),
  publishedPackages:n(catalogRows[0]?.published),draftPackages:n(catalogRows[0]?.draft),
 };
}
