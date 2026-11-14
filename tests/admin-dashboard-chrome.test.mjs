import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("overview recent enquiries share the exact directory row and mobile card renderer",()=>{
 const preview=source("src/features/admin/components/enquiry-table.tsx");
 const shared=source("src/features/admin/components/enquiry-directory.tsx");
 const overview=source("src/features/admin/sections/overview-section.tsx");
 assert.match(shared,/export function EnquiryRecords/);
 assert.match(shared,/<table/);
 assert.match(shared,/scope="col"/);
 assert.match(shared,/scope="row"/);
 assert.match(shared,/xl:hidden/);
 assert.match(shared,/xl:block/);
 assert.match(preview,/EnquiryRecords/);
 assert.match(preview,/describeAirport\(row\.origin\)/);
 assert.match(preview,/href:"\/admin\/enquiries\/"\+row\.id/);
 assert.match(overview,/recentEnquiries\(7\)/);
 assert.match(overview,/<EnquiryTable rows=\{enquiries\}/);
 assert.match(overview,/Latest general travel requests/);
 assert.doesNotMatch(preview,/overflow-x-auto/);
});
test("topbar has functional URL-scoped search and real links rather than fake notification badges",()=>{
 const chrome=source("src/features/admin/components/admin-topbar.tsx");
 const nav=source("src/features/admin/lib/admin-navigation.ts");
 assert.match(chrome,/method="GET"/);
 assert.match(chrome,/action=\{scope\}/);
 assert.match(chrome,/name="q"/);
 assert.match(chrome,/type="search"/);
 assert.match(chrome,/searchScopes\.map/);
 assert.match(chrome,/Search enquiries, customers, references/);
 assert.match(chrome,/aria-expanded=\{searchOpen\}/);
 assert.match(chrome,/aria-label="Admin breadcrumb"/);
 assert.match(chrome,/currentAdminSection\(pathname\)/);
 assert.match(chrome,/Visit public website/);
 assert.match(chrome,/onLogout/);
 for(const path of ["/admin/enquiries","/admin/package-enquiries","/admin/visa-enquiries"])
   assert.ok(nav.includes(path),path);
 assert.doesNotMatch(chrome,/Bell|notificationCount|fake|dummy/i);
});
test("desktop and mobile sidebar share active nav and browser native drawer accessibility",()=>{
 const shell=source("src/features/admin/components/admin-shell.tsx");
 const css=source("src/app/globals.css");
 assert.match(shell,/<dialog/);
 assert.match(shell,/\.showModal\(\)/);
 assert.match(shell,/\.close\(\)/);
 assert.match(shell,/event\.target===event\.currentTarget/);
 assert.match(shell,/matchMedia\("\(min-width: 1024px\)"\)/);
 assert.match(shell,/AdminSidebar mobile/);
 assert.match(shell,/AdminTopbar/);
 assert.match(shell,/pathname\.startsWith\(item\.href\+"\/"\)/);
 assert.match(shell,/aria-current=\{pathname===item\.href/);
 assert.match(shell,/aria-label="Close navigation menu"/);
 assert.match(shell,/fetch\("\/api\/auth\/logout"/);
 assert.match(shell,/response\.ok/);
 assert.match(css,/\.admin-mobile-drawer::backdrop/);
 assert.match(css,/prefers-reduced-motion/);
});
test("dashboard cards label only the actual general enquiry metrics",()=>{
 const overview=source("src/features/admin/sections/overview-section.tsx");
 const data=source("src/server/admin-data.ts");
 assert.match(overview,/General enquiries/);
 assert.match(overview,/New requests/);
 assert.match(overview,/In progress/);
 assert.match(overview,/Last 7 days/);
 assert.match(data,/FROM enquiries/);
 assert.doesNotMatch(overview,/Total sales|Active bookings|Revenue/);
});
