import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync,existsSync } from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("visa form uses country-first city lookup and not an airport",()=>{
 const v=read("src/features/booking/components/visa-request-fields.tsx");
 assert.match(v,/Destination country/);assert.match(v,/Destination city/);
 assert.match(v,/disabled=\{!country\}/);assert.match(v,/api\/visa\/cities/);
 assert.match(v,/Enter the city name manually/);assert.doesNotMatch(v,/AirportCombobox/);
 for(const field of ["Visa type","Travel purpose","Intended travel date","Travellers"])
   assert.ok(v.includes(field),field);
});
test("visa submits to an independent and audited table",()=>{
 const api=read("src/app/api/visa-enquiries/route.ts"),schema=read("src/server/visa-enquiry-schema.ts");
 for(const name of ["consentOrigin(req)","consumeRateLimit","visaEnquirySchema.safeParse",
   "INSERT INTO visa_enquiries","visa_enquiry_events","audit_events","/admin/visa-enquiries"])
   assert.ok(api.includes(name),name);
 assert.doesNotMatch(api,/INSERT INTO enquiries\(/);
 assert.match(schema,/validCountryCodes/);assert.match(schema,/consent:z.literal\(true\)/);
});
test("country-specific city suggestions use genuine city source with manual fallback",()=>{
 const api=read("src/app/api/visa/cities/route.ts");
 assert.match(api,/countryIds:country/);assert.match(api,/namePrefix:q/);
 assert.match(api,/wirefreethought\.com/);assert.match(api,/AbortController/);
 assert.match(api,/unavailable:true/);assert.match(api,/validCountryCodes/);
});
test("tours select only published packages and offer preview before request",()=>{
 const api=read("src/app/api/packages/options/route.ts");
 const tour=read("src/features/booking/components/tour-request-fields.tsx");
 assert.match(api,/filter\(x=>x.status==="published"\)/);
 assert.match(tour,/Select a published package/);assert.match(tour,/showModal\(\)/);
 assert.match(tour,/bottom-0 top-auto/);assert.match(tour,/Full package page/);
 assert.match(tour,/Continue with this tour/);
 assert.doesNotMatch(tour,/AirportCombobox/);
});
test("shared contact step routes visa to visa table, tours to package table and preserves other services",()=>{
 const w=read("src/features/booking/components/enquiry-wizard.tsx");
 assert.match(w,/Contact details/);assert.match(w,/\/api\/visa-enquiries/);
 assert.match(w,/\/api\/packages\//);assert.match(w,/service==="visa"/);
 assert.match(w,/service==="holiday"/);assert.match(w,/serviceRequest: service === "corporate"/);
 assert.match(w,/flightRequest: service === "flight"/);
});
test("visa admin supports filters, secure export and audited staff changes",()=>{
 const nav=read("src/features/admin/components/admin-shell.tsx");
 const list=read("src/features/admin/sections/visa-enquiries-section.tsx");
 const csv=read("src/app/api/admin/visa-enquiries/export/route.ts");
 const patch=read("src/app/api/admin/visa-enquiries/[id]/route.ts");
 assert.match(nav,/\/admin\/visa-enquiries/);
 for(const q of ['name="q"','name="status"','name="country"','name="type"','name="from"','name="to"'])
   assert.ok(list.includes(q),q);
 assert.match(csv,/canManage\(staff\)/);assert.match(csv,/excelCsvRow/);
 assert.match(csv,/data.total>5000/);assert.match(csv,/private, no-store/);
 assert.match(patch,/canEdit\(staff\)/);assert.match(patch,/consentOrigin\(req\)/);
 assert.match(patch,/visa_enquiry_events/);assert.match(patch,/audit_events/);
 assert.ok(existsSync(new URL("../src/app/admin/visa-enquiries/[id]/page.tsx",import.meta.url)));
});
test("visa schema migration is additive and does not touch existing enquiry tables",()=>{
 const sql=read("db/migrations/003_visa_enquiries.sql");
 assert.match(sql,/CREATE TABLE IF NOT EXISTS visa_enquiries/);
 assert.match(sql,/CREATE TABLE IF NOT EXISTS visa_enquiry_events/);
 assert.doesNotMatch(sql,/\bDROP\b|\bTRUNCATE\b|\bDELETE FROM\b/i);
});
