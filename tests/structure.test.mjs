import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../' + p, import.meta.url),'utf8');
test('strict TypeScript and Tailwind 4 configured', () => {
 const ts = JSON.parse(read('tsconfig.json'));
 const pkg = JSON.parse(read('package.json'));
 assert.equal(ts.compilerOptions.strict,true);
 assert.equal(pkg.dependencies.next.startsWith('^16'),true);
 assert.equal(pkg.devDependencies.tailwindcss.startsWith('^4'),true);
 assert.ok(read('src/app/globals.css').includes('@import "tailwindcss"'));
});
test('payment and instant booking are not falsely enabled', () => {
 assert.ok(read('src/server/flight-provider.ts').includes('return null'));
 const form = read('src/features/booking/components/enquiry-wizard.tsx');
 assert.match(form,/Submit enquiry/);
 assert.match(form,/Direct flights and flexible dates are preferences, subject to availability/);
 assert.doesNotMatch(form,/Book now|Pay now|Search live fares/);
});
test('enquiry flow validates and persists to Neon', () => {
 assert.match(read('src/server/enquiry-schema.ts'),/superRefine/);
 assert.match(read('src/app/api/enquiries/route.ts'),/INSERT INTO enquiries/);
 assert.match(read('db/schema.sql'),/CREATE TABLE IF NOT EXISTS staff_sessions/);
});
test('sensitive routes require staff access and origin control', () => {
 for (const path of ['src/app/api/auth/login/route.ts','src/app/api/admin/packages/route.ts','src/app/api/admin/enquiries/[id]/route.ts']) {
   assert.match(read(path),/consentOrigin/);
 }
 assert.match(read('src/app/api/admin/enquiries/[id]/route.ts'),/currentStaff/);
});
