import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');

test('first-party website icon exists and has content', () => {
 assert.ok(statSync(new URL('../src/app/icon.png', import.meta.url)).size > 10000);
 assert.ok(statSync(new URL('../public/branding/sapphire-quest-icon.png', import.meta.url)).size > 10000);
});
test('thin public routes use modular features/sections', () => {
 for(const route of ['about','contact','corporate-travel','visa-assistance','request','privacy','terms','thanks','packages']){
  const s=read(`src/app/${route}/page.tsx`);
  assert.match(s,/features\//,`${route} should compose a feature`);
 }
 assert.match(read('src/components/layout/page-hero.tsx'),/bg-black\/60/);
});
test('home booking has journey and personal steps before submission', () => {
 const home=read('src/app/page.tsx');
 const wizard=read('src/features/booking/components/enquiry-wizard.tsx');
 assert.match(home,/BookingPanel/);
 assert.match(wizard,/step === 1/);
 assert.match(wizard,/\/api\/enquiries/);
 assert.match(wizard,/AirportCombobox/);
 assert.match(read('src/app/api/airports/route.ts'),/searchAirports/);
});
test('package API validates structured rich text, pricing and image gallery', () => {
 const schema=read('src/server/package-schema.ts');
 assert.match(schema,/discountPercent/);
 assert.match(schema,/priceAmount/);
 assert.match(schema,/details/);
 assert.match(schema,/max\(5\)/);
 assert.match(read('src/app/api/admin/media/auth/route.ts'),/canManage/);
 const migration=read('db/migrations/001_enhanced_packages.sql');
 assert.match(migration,/ADD COLUMN IF NOT EXISTS/);
 assert.match(migration,/SAMPLE — Singapore/);
 assert.doesNotMatch(migration,/DROP TABLE|TRUNCATE TABLE/i);
});
test('all styling changes preserve pnpm usage', () => {
 assert.ok(existsSync(new URL('../pnpm-lock.yaml', import.meta.url)));
 assert.match(read('package.json'),/pnpm@10/);
});

test('page-specific sections keep destinations and services independent from home', () => {
 assert.match(read('src/app/services/page.tsx'),/features\/services\/sections\/service-catalog/);
 assert.match(read('src/app/destinations/page.tsx'),/features\/destinations\/sections\/destination-directory/);
 assert.match(read('src/app/packages/\[slug\]/page.tsx'),/PackagePublicPage/);
 assert.match(read('src/components/layout/page-hero.tsx'),/bg-black\/60/);
});
test('package editor safely resets after creation and rejects insecure image links', () => {
 const editor=read('src/features/admin/components/package-fields.tsx');
 const schema=read('src/server/package-schema.ts');
 const media=read('src/features/admin/components/package-media.tsx');
 assert.match(editor,/setEditorReset/);
 assert.match(editor,/key=\{editorReset\}/);
 assert.match(schema,/url\.protocol==="https:"/);
 assert.match(media,/u\.protocol!=="https:"/);
});
test('airport picker supports keyboard selection and does not preselect a journey', () => {
 const picker=read('src/features/booking/components/airport-combobox.tsx');
 const wizard=read('src/features/booking/components/enquiry-wizard.tsx');
 assert.match(picker,/ArrowDown/);
 assert.match(picker,/aria-activedescendant/);
 assert.match(wizard,/origin: initial\.from \|\| ""/);
 assert.match(wizard,/destination: initial\.to \|\| ""/);
});
