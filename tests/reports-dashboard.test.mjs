import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("admin brand shrinks only in the workspace and Reports is permission-gated",()=>{
 const mark=read("src/components/ui/brand-mark.tsx");
 const shell=read("src/features/admin/components/admin-shell.tsx");
 const nav=read("src/features/admin/lib/admin-navigation.ts");
 const report=read("src/features/admin/sections/reports-section.tsx");
 assert.match(mark,/compact \? "h-auto w-\[105px\]/);
 assert.match(mark,/w-\[174px\] object-contain sm:w-\[220px\]/);
 assert.match(shell,/<BrandMark inverse compact href="\/admin"/);
 assert.match(shell,/item\.href!=="\/admin\/reports"/);
 assert.match(shell,/role==="owner"\|\|role==="manager"/);
 assert.match(nav,/Reports & insights/);
 assert.match(nav,/\/admin\/reports/);
 assert.match(report,/currentStaff\(\)/);
 assert.match(report,/if\(!canManage\(staff\)\)notFound\(\)/);
});
test("reports use actual existing Neon enquiry tables with bounded rolling windows",()=>{
 const db=read("src/server/report-data.ts");
 const math=read("src/features/admin/lib/report-math.ts");
 for(const table of ["enquiries","package_enquiries","visa_enquiries","travel_packages","staff_users"]){
  assert.ok(db.includes(table),"Expected real table "+table);
 }
 assert.match(db,/lower\(btrim\(email\)\)/);
 assert.match(db,/repeat_contacts/);
 assert.match(db,/unreviewed48/);
 assert.match(db,/awaiting_customer/);
 assert.match(db,/follow_up/);
 assert.match(db,/status='confirmed'/);
 assert.match(db,/date_trunc\(/);
 assert.match(db,/LIMIT 6/);
 assert.match(db,/SELECT u\.name/);
 assert.match(math,/readReportDays/);
 assert.match(math,/fillReportTrend/);
 assert.doesNotMatch(db,/revenue|profit|total_sales|payment_transactions/i);
});
test("reports have real accessible time series, zero-state and clear metric scope",()=>{
 const view=read("src/features/admin/components/reports-dashboard.tsx");
 assert.match(view,/<table className="sr-only"/);
 assert.match(view,/Reports &amp; insights/);
 assert.match(view,/No enquiry sources for this period/);
 assert.match(view,/Distinct submitted addresses/);
 assert.match(view,/marked confirmed/i);
 assert.match(view,/not paid bookings/);
 assert.match(view,/not a measured response-time SLA/);
 assert.match(view,/Date buckets use UTC/);
 assert.match(view,/\/admin\/package-enquiries/);
 assert.match(view,/\/admin\/visa-enquiries/);
 assert.match(view,/api\/admin\/reports\/export/);
 assert.doesNotMatch(view,/Estimated revenue|Bookings completed|Profit margin/i);
});
test("report export is authenticated, aggregation-only, injection-safe and private",()=>{
 const api=read("src/app/api/admin/reports/export/route.ts");
 const csv=read("src/server/excel-csv.ts");
 assert.match(api,/currentStaff/);
 assert.match(api,/canManage\(staff\)/);
 assert.match(api,/readReportDays/);
 assert.match(api,/excelCsvRow/);
 assert.match(api,/private, no-store/);
 assert.match(api,/sapphire-quest-enquiry-insights/);
 assert.match(csv,/\\uFF1D/);
 const page=read("src/app/admin/reports/page.tsx");
 assert.match(page,/force-dynamic/);
 assert.match(page,/robots:\{index:false,follow:false\}/);
});
