import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("package cards are short, visually structured and have independent quote CTA", () => {
  const cards = read("src/features/packages/sections/package-cards.tsx");
  assert.match(cards, /CalendarDays/);
  assert.match(cards, /MapPin/);
  assert.match(cards, /Get quote/);
  assert.match(cards, /View trip/);
  assert.match(cards, /#package-enquiry/);
  assert.match(cards, /PackageRating/);
  assert.doesNotMatch(cards, /line-clamp-3/);
});
test("ratings require actual review count and source before public stars are shown", () => {
  const display = read("src/features/packages/components/package-rating.tsx");
  const schema = read("src/server/package-schema.ts");
  assert.match(display, /if \(score == null \|\| !count \|\| !source/);
  assert.match(display, /Curated experience/);
  assert.match(schema, /ratingScore:\s*null,\s*ratingCount:\s*0,\s*ratingSource:\s*""/);
  assert.match(schema, /genuine customer feedback/);
});
test("dedicated package form never uses the generic booking wizard", () => {
  const details = read("src/features/packages/sections/package-details.tsx");
  const form = read("src/features/packages/components/package-quote-form.tsx");
  assert.match(details, /<PackageQuoteForm/);
  assert.match(details, /id="package-enquiry"/);
  assert.doesNotMatch(details, /\/request\?service=/);
  assert.match(form, /preferredDate/);
  assert.match(form, /departureCity/);
  assert.match(form, /consent/);
  assert.match(form, /\/api\/packages\//);
  assert.match(form, /reference/);
});
test("public package submissions are protected, persisted and notified separately", () => {
  const api = read("src/app/api/packages/[slug]/enquiries/route.ts");
  assert.match(api, /consentOrigin\(req\)/);
  assert.match(api, /consumeRateLimit/);
  assert.match(api, /packageEnquirySchema\.safeParse/);
  assert.match(api, /findPublicPackage/);
  assert.match(api, /INSERT INTO package_enquiries/);
  assert.match(api, /package_enquiry_events/);
  assert.match(api, /after\(\(\) => notifyNewEnquiry/);
  assert.match(api, /email: data\.email/);
  assert.match(api, /dashboardPath: "\/admin\/package-enquiries"/);
});
test("full-width admin package pages replace inline collapsible editors", () => {
  const workspace = read("src/features/admin/sections/packages-workspace.tsx");
  const editor = read("src/features/admin/sections/full-page-package-editor.tsx");
  assert.match(workspace, /\/admin\/packages\/new/);
  assert.match(workspace, /\/edit/);
  assert.doesNotMatch(workspace, /PackageEditor/);
  assert.match(editor, /<PackageFields/);
  for (const path of ["src/app/admin/packages/new/page.tsx","src/app/admin/packages/[id]/edit/page.tsx"]) {
    assert.ok(existsSync(new URL("../" + path, import.meta.url)));
  }
});
test("package enquiry directory has filters and uses role-controlled Excel CSV", () => {
  const listing = read("src/features/admin/sections/package-enquiries-section.tsx");
  const exportApi = read("src/app/api/admin/package-enquiries/export/route.ts");
  const shared = read("src/features/admin/components/enquiry-directory.tsx");
  assert.match(listing, /packageEnquiryOptions/);
  assert.match(listing, /EnquiryDirectory/);
  for (const name of ['name="package"','name="from"','name="to"']) {
    assert.ok(listing.includes(name), name);
  }
  for (const name of ['name="q"','name="status"']) {
    assert.ok(shared.includes(name),name);
  }
  assert.match(exportApi, /canManage\(staff\)/);
  assert.match(exportApi, /excelCsvRow/);
  assert.match(exportApi, /data.total > 5000/);
  assert.match(exportApi, /private, no-store/);
  const csv = read("src/server/excel-csv.ts");
  assert.match(csv, /keepText/);
  assert.match(csv, /\\t/);
  assert.match(csv, /\\uFF1D/);
});
test("package enquiry status/assignment/note mutations have auth, provenance and audit", () => {
  const api = read("src/app/api/admin/package-enquiries/[id]/route.ts");
  assert.match(api, /currentStaff\(\)/);
  assert.match(api, /canEdit\(staff\)/);
  assert.match(api, /consentOrigin\(req\)/);
  assert.match(api, /packageEnquiryChangeSchema/);
  assert.match(api, /package_enquiry_events/);
  assert.match(api, /audit_events/);
  assert.match(read("src/features/admin/lib/admin-navigation.ts"), /\/admin\/package-enquiries/);
});
