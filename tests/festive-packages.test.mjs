import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const packages = JSON.parse(read("src/data/festive-packages.json"));

test("five festive offers and one curated Singapore experience have responsible commercial content", () => {
  assert.equal(packages.length, 6);
  assert.equal(new Set(packages.map((p) => p.slug)).size, 6);
  assert.deepEqual(packages.slice(0, 5).map((p) => p.destination), [
    "Accra, Ghana", "Nairobi, Kenya", "Zanzibar, Tanzania",
    "Dubai, United Arab Emirates", "Cape Town, South Africa",
  ]);
  assert.deepEqual(packages.slice(0, 5).map((p) => p.priceAmount), [
    1350000, 2650000, 3250000, 3490000, 4350000,
  ]);
  const singapore = packages.find((p) => p.slug === "singapore-signature-city-gardens-culture");
  assert.ok(singapore);
  assert.equal(singapore.priceAmount, null, "Do not invent a Singapore price without a contracted supplier quote");
  assert.equal(singapore.destination, "Singapore");
    for (const item of packages) {
    assert.equal(item.status, "published");
    assert.equal(item.currency, "NGN");
    assert.equal(item.discountPercent, 0);
    assert.ok(item.summary.length >= 80 && item.summary.length <= 750);
    assert.ok(item.highlights.length < 320);
    assert.ok(item.features.length >= 5 && item.features.length <= 20);
    assert.deepEqual(item.images, []);
    assert.ok(item.details.blocks.length >= 16);
    assert.ok(item.details.blocks.some((b) => b.kind === "numbered"));
    assert.ok(item.details.blocks.some((b) => b.kind === "heading"));
    const allText = item.details.blocks.flatMap((b) => b.runs).map((r) => r.text).join(" ");
    assert.match(allText, /Day 1/);
    assert.match(allText, /Day 5/);
    assert.match(allText, /Before you travel/);
    assert.doesNotMatch(allText, /demonstration|dummy|fake booking|SAMPLE/i);
    assert.ok(allText.length <= 12000);
  }
});

test("public pages no longer display old demonstration listings or technical disclaimer", () => {
  const cards = read("src/features/packages/sections/package-cards.tsx");
  const catalog = read("src/data/festive-packages.ts");
  assert.doesNotMatch(cards, /Displayed prices, if any, are indicative/);
  assert.match(cards, /publicPackageCatalog/);
  assert.match(catalog, /legacyDemonstrationSlugs/);
  for (const slug of ["uk-city-break", "singapore-city-discovery", "dubai-business-visit"]) {
    assert.ok(catalog.includes('"' + slug + '"'));
  }
  assert.match(read("src/features/packages/components/package-price.tsx"), />From</);
});

test("admin import is staff protected, idempotent and retains later edits", () => {
  const api = read("src/app/api/admin/packages/seasonal/route.ts");
  const catalog = read("src/server/package-catalog.ts");
  const widget = read("src/features/admin/components/festive-collection-import.tsx");
  assert.match(api, /consentOrigin\(req\)/);
  assert.match(api, /currentStaff\(\)/);
  assert.match(api, /canManage\(staff\)/);
  assert.match(api, /ON CONFLICT \(slug\) DO NOTHING/);
  assert.match(api, /audit_events/);
  assert.match(catalog, /bySlug\.set\(record\.slug, record\)/);
  assert.match(catalog, /bySlug\.delete\(record\.slug\)/);
  assert.match(widget, /router\.refresh\(\)/);
});

test("site policies have final client-facing language", () => {
  const terms = read("src/features/legal/sections/terms-details.tsx");
  const privacy = read("src/features/legal/sections/privacy-details.tsx");
  assert.doesNotMatch(terms + privacy, /preliminary|initial notice|before public launch/i);
  assert.match(terms, /before payment/);
  assert.match(privacy, /privacy enquiries/);
});
