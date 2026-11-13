import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("admin enquiry screen is a separate reusable component, not mixed into database loader",()=>{
  const loader=read("src/features/admin/sections/enquiry-detail-section.tsx");
  const view=read("src/features/admin/components/enquiry-detail-view.tsx");
  assert.match(loader,/currentStaff\(\)/);
  assert.match(loader,/redirect\("\/admin\/login"\)/);
  assert.match(loader,/canEdit\(user\)/);
  assert.match(loader,/SELECT id,reference,name,email,phone/);
  assert.match(loader,/EnquiryDetailView/);
  assert.match(view,/aria-label="Breadcrumb"/);
  assert.match(view,/Customer details/);
  assert.match(view,/Trip overview/);
  assert.match(view,/Enquiry management/);
  assert.match(view,/Activity history/);
  assert.match(view,/events\.map/);
  assert.doesNotMatch(view,/fake|placeholder|SQ-ENQ-10457/i);
});
test("all selected airport codes display human-readable city and IATA code",()=>{
  const view=read("src/features/admin/components/enquiry-detail-view.tsx");
  const lookup=read("src/server/airport-lookup.ts");
  const directory=JSON.parse(read("src/data/airport-directory.json"));
  assert.ok(directory.length>500);
  for(const code of ["ABV","LOS","DOH","DXB"]){
    const x=directory.find(x=>x.code===code);
    assert.ok(x && x.city,code+" must resolve to a real directory city");
  }
  assert.match(view,/airportDisplay\(leg\.origin\)/);
  assert.match(view,/airportDisplay\(leg\.destination\)/);
  assert.match(view,/\(\{from\.code\}\)/);
  assert.match(view,/\(\{to\.code\}\)/);
  assert.match(view,/City not available for one of the airport codes/);
  assert.match(lookup,/import "server-only"/);
  assert.match(lookup,/airport-directory\.json/);
  assert.match(lookup,/Map<string, AirportSuggestion>/);
  assert.doesNotMatch(lookup,/fetch\(/);
});
test("existing notes are parsed only when they bear the server-generated flight marker",()=>{
  const src=read("src/features/admin/lib/enquiry-itinerary.ts");
  assert.match(src,/FLIGHT ENQUIRY — customer-selected details/);
  assert.match(src,/service === "flight"/);
  assert.match(src,/Customer message:/);
  assert.match(src,/directOnly:/);
  assert.match(src,/flexibleDates:/);
  assert.match(src,/legs: legs.length/);
  assert.doesNotMatch(src,/eval\(|Function\(/);
});
test("enquiry status and staff assignment are updated in one atomic request",()=>{
  const ui=read("src/features/admin/components/enquiry-actions.tsx");
  const api=read("src/app/api/admin/enquiries/[id]/route.ts");
  assert.match(ui,/action: "manage"/);
  assert.match(ui,/action:"note"/);
  assert.match(ui,/Quick actions/);
  assert.match(ui,/Follow-up/);
  assert.match(ui,/role="status"/);
  assert.match(api,/z\.literal\("manage"\)/);
  assert.match(api,/WITH changed AS/);
  assert.match(api,/assigned_to=/);
  assert.match(api,/status=/);
  assert.match(api,/enquiry_events/);
  assert.match(api,/audit_events/);
  assert.match(api,/canEdit\(user\)/);
  assert.match(api,/consentOrigin\(req\)/);
  // Event type is the existing 'status', so we do not violate the production DB CHECK constraint.
  assert.match(api,/'status',/);
  assert.doesNotMatch(api,/'manage',\$\{message\}/);
});
test("screens respect real privacy, no fake booking/quotation functionality",()=>{
  const view=read("src/features/admin/components/enquiry-detail-view.tsx");
  const actions=read("src/features/admin/components/enquiry-actions.tsx");
  assert.match(view,/new Date\(value\)/);
  assert.match(view,/Africa\/Lagos/);
  assert.match(actions,/!editable/);
  assert.match(actions,/safeEmail/);
  assert.match(actions,/safePhone/);
  assert.doesNotMatch(view+actions,/Convert to booking|Create quotation|fake data|demo itinerary/i);
});

test("record header copy and print buttons perform real browser actions",()=>{
  const tools=read("src/features/admin/components/enquiry-detail-tools.tsx");
  const view=read("src/features/admin/components/enquiry-detail-view.tsx");
  const css=read("src/app/globals.css");
  assert.match(view,/EnquiryDetailTools reference=\{e\.reference\}/);
  assert.match(tools,/navigator\.clipboard\.writeText\(reference\)/);
  assert.match(tools,/window\.print\(\)/);
  assert.match(tools,/role="alert"/);
  assert.match(css,/@media print/);
  assert.match(css,/enquiry-detail-print/);
});
