import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("three enquiry sections render one semantic desktop/mobile design",()=>{
 const shared=read("src/features/admin/components/enquiry-directory.tsx");
 const paths=[
  "src/features/admin/sections/enquiries-section.tsx",
  "src/features/admin/sections/package-enquiries-section.tsx",
  "src/features/admin/sections/visa-enquiries-section.tsx",
 ];
 for(const path of paths){
   const section=read(path);
   assert.match(section,/<EnquiryDirectory/);
   assert.match(section,/canManage\(staff\)/);
   assert.match(section,/rows=\{/);
   assert.match(section,/status:/);
   assert.match(section,/href:/);
 }
 assert.match(shared,/<table/);
 assert.match(shared,/scope="col"/);
 assert.match(shared,/scope="row"/);
 assert.match(shared,/<caption/);
 assert.match(shared,/xl:hidden/);
 assert.match(shared,/xl:block/);
 assert.match(shared,/href=\{item.href\}/);
 assert.match(shared,/rounded-\[15px\]/);
 assert.match(shared,/bg-\[#f8f8f9\]/);
 assert.match(shared,/bg-\[#f1f1f3\]/);
 assert.match(shared,/bg-\[#ecf4ff\]/);
});
test("filter and export controls work server side without made-up actions",()=>{
 const shared=read("src/features/admin/components/enquiry-directory.tsx");
 const general=read("src/server/general-enquiry-data.ts");
 const api=read("src/app/api/admin/enquiries/export/route.ts");
 assert.match(shared,/method="GET"/);
 assert.match(shared,/name="q"/);
 assert.match(shared,/name="status"/);
 assert.match(shared,/<details/);
 assert.match(shared,/Apply filters/);
 assert.match(shared,/exportHref/);
 assert.match(shared,/new URLSearchParams/);
 assert.match(shared,/pageSize/);
 assert.doesNotMatch(shared,/Create Invoice|Create Enquiry/);
 assert.match(general,/ORDER BY e.created_at DESC,e.id DESC/);
 assert.match(general,/ESCAPE/);
 assert.match(general,/readGeneralFilters/);
 assert.match(api,/currentStaff/);
 assert.match(api,/canManage\(staff\)/);
 assert.match(api,/excelCsvRow/);
 assert.match(api,/result.total>5000/);
 assert.match(api,/private, no-store/);
 assert.match(api,/nosniff/);
});
test("invalid dates never reach SQL date casts for any enquiry type",()=>{
 const date=read("src/server/date-filter.ts");
 const general=read("src/server/general-enquiry-data.ts");
 const pkg=read("src/server/package-enquiry-data.ts");
 const visa=read("src/server/visa-enquiry-data.ts");
 assert.match(date,/date.toISOString\(\).slice\(0,10\)===value/);
 for(const name of [general,pkg,visa])assert.match(name,/safeFilterDate/);
});
test("real admin links and statuses differ appropriately across services",()=>{
 const general=read("src/features/admin/sections/enquiries-section.tsx");
 const pkg=read("src/features/admin/sections/package-enquiries-section.tsx");
 const visa=read("src/features/admin/sections/visa-enquiries-section.tsx");
 assert.match(general,/generalStatuses/);
 assert.match(general,/\/admin\/enquiries\/"\+row.id/);
 assert.match(pkg,/packageEnquiryStatuses/);
 assert.match(pkg,/\/admin\/package-enquiries\/"\+item.id/);
 assert.match(visa,/visaStatusValues/);
 assert.match(visa,/\/admin\/visa-enquiries\/"\+item.id/);
 assert.match(pkg,/packageTitle/);
 assert.match(visa,/countryName/);
 assert.match(visa,/visaTypes/);
});
