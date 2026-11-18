import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("admin campaign management remains permission-gated and in the sidebar", () => {
  const page = read("src/app/admin/banners/page.tsx");
  const shell = read("src/features/admin/components/admin-shell.tsx");
  const nav = read("src/features/admin/lib/admin-navigation.ts");
  assert.match(page, /currentStaff\(\)/);
  assert.match(page, /canManage\(staff\)/);
  assert.match(nav, /Promotional banners/);
  assert.match(nav, /\/admin\/banners/);
  assert.match(shell, /item\.href!=="\/admin\/banners"/);
});

test("new campaign images use the existing signed ImageKit uploader, initially unpublished", () => {
  const manager = read("src/features/admin/components/banner-manager.tsx");
  assert.match(manager, /\/api\/admin\/media\/auth/);
  assert.match(manager, /https:\/\/upload\.imagekit\.io\/api\/v1\/files\/upload/);
  assert.match(manager, /const created: ManagedBanner/);
  assert.match(manager, /published: false/);
  assert.match(manager, /file\.size > 5 \* 1024 \* 1024/);
  assert.match(manager, /Publish advert/);
  assert.match(manager, /Unpublish/);
});

test("server-side campaign mutations validate permission, origin, managed folder and requested settings", () => {
  const api = read("src/app/api/admin/banners/route.ts");
  const media = read("src/server/banner-media.ts");
  assert.match(api, /canManage\(staff\)/);
  assert.match(api, /consentOrigin\(req\)/);
  assert.match(api, /edit\.safeParse/);
  assert.match(api, /fileIdSchema/);
  assert.match(api, /revalidateTag/);
  assert.match(api, /private, no-store/);
  assert.match(media, /IMAGEKIT_PRIVATE_KEY/);
  assert.match(media, /Basic /);
  assert.match(media, /inBannerFolder/);
  assert.match(media, /BANNER_ACTIVE_TAG/);
});

test("only eligible published ImageKit banners reach public pages", () => {
  const popup = read("src/features/home/components/travel-offer-popup.tsx");
  const publicRoute = read("src/app/api/public/banner/route.ts");
  const media = read("src/server/banner-media.ts");
  assert.match(popup, /\/api\/public\/banner/);
  assert.match(popup, /banner\.href/);
  assert.match(popup, /banner\.imageUrl/);
  assert.match(popup, /showModal/);
  assert.match(popup, /sessionStorage/);
  assert.match(publicRoute, /publishedBanner\(page\)/);
  assert.match(media, /banner\.published && bannerCanDisplay\(banner, page, now\)/);
  assert.doesNotMatch(popup, /sapphire-quest-travel-banner\.webp/);
  assert.ok(existsSync(new URL("../src/app/admin/banners/page.tsx", import.meta.url)));
});

test("existing banners without ownership tags can still be edited, without Neon migrations", () => {
  const media = read("src/server/banner-media.ts");
  assert.match(media, /Tags are optional on upload/);
  assert.match(media, /inBannerFolder\(result\.filePath\)/);
  assert.match(media, /result\.fileType !== "image"/);
  assert.match(media, /BANNER_OWNER_TAG, bannerRouteTag\(input\.href\)/);
  assert.doesNotMatch(media, /if \(!tags\.includes\(BANNER_OWNER_TAG\)\) return null/);
  assert.doesNotMatch(media, /@\/server\/db|INSERT INTO|UPDATE marketing_banners|DATABASE_URL/);
});
