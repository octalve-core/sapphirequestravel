import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("admin banner management is permission-gated and in the sidebar", () => {
  const page = read("src/app/admin/banners/page.tsx");
  const shell = read("src/features/admin/components/admin-shell.tsx");
  const nav = read("src/features/admin/lib/admin-navigation.ts");
  assert.match(page, /currentStaff\(\)/);
  assert.match(page, /canManage\(staff\)/);
  assert.match(page, /redirect\("\/admin\/login"\)/);
  assert.match(nav, /Promotional banners/);
  assert.match(nav, /\/admin\/banners/);
  assert.match(shell, /item\.href!=="\/admin\/banners"/);
});

test("uploads use existing ImageKit signing and stay unpublished until approval", () => {
  const manager = read("src/features/admin/components/banner-manager.tsx");
  const contract = read("src/features/home/lib/banner-contract.ts");
  assert.match(manager, /\/api\/admin\/media\/auth/);
  assert.match(manager, /https:\/\/upload\.imagekit\.io\/api\/v1\/files\/upload/);
  assert.match(manager, /newBanner: ManagedBanner/);
  assert.match(manager, /published: false/);
  assert.match(manager, /file\.size > 5 \* 1024 \* 1024/);
  assert.match(manager, /Publish banner/);
  assert.match(manager, /Unpublish/);
  assert.match(contract, /sapphirequest\/banners\//);
});

test("publication API validates, authorizes, and prevents other-file updates", () => {
  const api = read("src/app/api/admin/banners/route.ts");
  const data = read("src/server/banner-media.ts");
  assert.match(api, /canManage\(staff\)/);
  assert.match(api, /consentOrigin\(req\)/);
  assert.match(api, /mutation\.safeParse/);
  assert.match(api, /fileId: z\.string\(\)\.regex/);
  assert.match(api, /revalidateTag/);
  assert.match(api, /private, no-store/);
  assert.match(data, /IMAGEKIT_PRIVATE_KEY/);
  assert.match(data, /Basic /);
  assert.match(data, /inBannerFolder/);
  assert.match(data, /setTags\(other\.fileId/);
  assert.match(data, /BANNER_ACTIVE_TAG/);
});

test("homepage only renders a published media banner, never a hardcoded campaign", () => {
  const popup = read("src/features/home/components/travel-offer-popup.tsx");
  const publicRoute = read("src/app/api/public/banner/route.ts");
  const data = read("src/server/banner-media.ts");
  assert.match(popup, /\/api\/public\/banner/);
  assert.match(popup, /banner\.href/);
  assert.match(popup, /banner\.imageUrl/);
  assert.match(popup, /showModal/);
  assert.match(popup, /sessionStorage/);
  assert.match(publicRoute, /publishedBanner/);
  assert.match(data, /candidates\.find\(\(banner\) => banner\.published\)/);
  assert.doesNotMatch(popup, /sapphire-quest-travel-banner\.webp/);
  assert.ok(existsSync(new URL("../src/app/admin/banners/page.tsx", import.meta.url)));
});

test("banners reuse ImageKit and do not depend on database migration", () => {
  const contract = read("src/features/home/lib/banner-contract.ts");
  const media = read("src/server/banner-media.ts");
  assert.doesNotMatch(media, /@\/server\/db|INSERT INTO|UPDATE marketing_banners|DATABASE_URL/);
  assert.match(contract, /bannerDestinations/);
});
