import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("promotions have an explicit allowlist of public pages and a WAT scheduling format", () => {
  const data = read("src/features/home/lib/banner-contract.ts");
  for (const page of ["/", "/packages", "/visa-assistance", "/services", "/about", "/contact"]) {
    assert.ok(data.includes('path: "' + page + '"'));
  }
  assert.match(data, /normalizeBannerPage/);
  assert.match(data, /bannerCanDisplay/);
  assert.match(data, /if \(settings\.startAt && now </);
  assert.match(data, /if \(settings\.endAt && now >=/);
  assert.match(data, /bannerSettingsTags/);
  assert.match(data, /readBannerSettings/);
  assert.match(data, /sq-start-/);
  assert.match(data, /sq-end-/);
  assert.match(data, /sq-delay-/);
});
test("banner admin editor can replace and delete assets and target pages and schedule", () => {
  const ui = read("src/features/admin/components/banner-manager.tsx");
  const api = read("src/app/api/admin/banners/route.ts");
  assert.match(ui, /Replace image/);
  assert.match(ui, /Delete image/);
  assert.match(ui, /window\.confirm/);
  assert.match(ui, /aria-label="Choose a replacement image"/);
  assert.match(ui, /bannerPages\.map/);
  assert.match(ui, /datetime-local/);
  assert.match(ui, /West Africa Time/);
  assert.match(ui, /delaySeconds/);
  assert.match(ui, /source\?\.title/);
  assert.match(ui, /published: false/);
  assert.match(api, /export async function DELETE/);
  assert.match(api, /export async function PATCH/);
  assert.match(api, /consentOrigin\(req\)/);
  assert.match(api, /canManage\(staff\)/);
  assert.match(api, /settings/);
  assert.match(api, /min\(1\)/);
  assert.match(api, /new Set\(values\)/);
  assert.match(api, /End time must be later than start time/);
});
test("banner deletion requires server-validated ImageKit folder membership", () => {
  const server = read("src/server/banner-media.ts");
  assert.match(server, /async function getBannerDetails/);
  assert.match(server, /inBannerFolder\(result\.filePath\)/);
  assert.match(server, /export async function deleteBanner/);
  assert.match(server, /getBannerDetails\(fileId\)/);
  assert.match(server, /method: "DELETE"/);
  assert.match(server, /"sapphire-banners"/);
  assert.doesNotMatch(server, /INSERT INTO|DROP TABLE|TRUNCATE TABLE/);
});
test("public popup checks page eligibility and does not block navigations", () => {
  const route = read("src/app/api/public/banner/route.ts");
  const popup = read("src/features/home/components/travel-offer-popup.tsx");
  const layout = read("src/components/layout/marketing-layout.tsx");
  assert.match(route, /normalizeBannerPage/);
  assert.match(route, /publishedBanner\(page\)/);
  assert.match(layout, /<TravelOfferPopup/);
  assert.match(popup, /usePathname/);
  assert.match(popup, /encodeURIComponent\(pathname\)/);
  assert.match(popup, /delaySeconds/);
  assert.match(popup, /banner\.endAt/);
  assert.match(popup, /sessionStorage/);
  assert.match(popup, /key=\{pathname\}/);
  assert.match(popup, /showModal/);
});
test("package editor can replace, reorder, remove and change featured cover", () => {
  const photos = read("src/features/admin/components/package-media.tsx");
  const form = read("src/features/admin/components/package-fields.tsx");
  assert.match(photos, /kind: "replace"/);
  assert.match(photos, /kind: "home"/);
  assert.match(photos, /onChange\(images\.map/);
  assert.match(photos, /onChange\(images\.filter/);
  assert.match(photos, /Make package cover/);
  assert.match(photos, /move\(index, 0\)/);
  assert.match(photos, /window\.confirm/);
  assert.match(photos, /The original ImageKit file will be preserved/);
  assert.match(photos, /onHomeImageChange/);
  assert.match(form, /onHomeImageChange=\{v=>updateHome\("image",v\)\}/);
});
