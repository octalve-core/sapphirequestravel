import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
test("canonical website host uses the now-live sapphirequesttravel.com domain", () => {
 for(const p of ["src/config/brand.ts","src/app/layout.tsx","src/app/sitemap.ts","src/app/robots.ts"]) {
   const source=read(p);
   assert.match(source, /https:\/\/www\.sapphirequesttravel\.com/);
   assert.doesNotMatch(source, /https:\/\/sapphirequestravel\.com/);
 }
});
test("full-page editor reports DB problems rather than presenting false 404", () => {
 const editor=read("src/features/admin/sections/full-page-package-editor.tsx");
 assert.match(editor, /let unavailable = false/);
 assert.match(editor, /role="alert"/);
 assert.match(editor, /migration 002/);
});
