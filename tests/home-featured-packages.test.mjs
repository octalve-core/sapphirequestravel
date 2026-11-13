import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const offers = JSON.parse(read("src/data/festive-packages.json"));

const expected = [
  ["singapore-signature-city-gardens-culture", "Singapore", "Southeast Asia", "/images/singapore.webp"],
  ["dubai-after-dark-festive-skyline-2026", "Global connections", "Dubai, United Arab Emirates", "/images/global-routes.webp"],
  ["zanzibar-azure-island-christmas-2026", "Coastal escapes", "Zanzibar, Tanzania", "/images/coastal.webp"],
  ["cape-town-sunbound-summer-coast-2026", "Meaningful moments", "Cape Town, South Africa", "/images/travel-moment.webp"],
];

test("four original home cards have matching real packages and existing photo URLs", () => {
  const featured = offers.filter((item) => item.details.home?.enabled).sort(
    (a, b) => a.details.home.position - b.details.home.position,
  );
  assert.equal(featured.length, 4);
  for (let index = 0; index < expected.length; index++) {
    const [slug, name, label, image] = expected[index];
    const item = featured[index];
    assert.equal(item.slug, slug);
    assert.equal(item.details.home.title, name);
    assert.equal(item.details.home.label, label);
    assert.equal(item.details.home.image, image);
    assert.ok(existsSync(new URL("../public" + image, import.meta.url)), image);
    assert.ok(item.status === "published");
  }
});

test("homepage retains original tile design while linking to package pages, not individual requests", () => {
  const home = read("src/features/home/sections/destination-showcase.tsx");
  assert.match(home, /homeFeaturedPackages/);
  assert.match(home, /grid gap-5 md:grid-cols-2/);
  assert.match(home, /min-h-\[355px\]/);
  assert.match(home, /bg-gradient-to-t from-\[#06162f\]\/85/);
  assert.match(home, /Explore the possibilities/);
  assert.match(home, /\/packages\//);
  assert.doesNotMatch(home, /\/request\?service=/);
  assert.doesNotMatch(home, /destinations\.map/);
  assert.match(read("src/app/page.tsx"), /force-dynamic/);
});

test("only published, opted-in and image-backed packages may feature, at most four", () => {
  const query = read("src/server/home-featured-packages.ts");
  assert.match(query, /publicPackageCatalog/);
  assert.match(query, /item\.status === "published"/);
  assert.match(query, /details\.home\?\.enabled/);
  assert.match(query, /\.slice\(0, 4\)/);
});

test("existing imported rows honour a staff override, including disabled", () => {
  const catalog = read("src/server/package-catalog.ts");
  const editor = read("src/features/admin/sections/full-page-package-editor.tsx");
  assert.match(catalog, /hasOwnProperty\.call\(objectDetails, "home"\)/);
  assert.match(catalog, /seedHome/);
  assert.match(editor, /seededHomeFeature/);
  assert.match(editor, /hasOwnProperty\.call\(rawDetails, "home"\)/);
});

test("package CMS includes homepage controls and does not lose them when rich text changes", () => {
  const fields = read("src/features/admin/components/package-fields.tsx");
  assert.match(fields, /Show this package on the homepage/);
  assert.match(fields, /updateHome\("position"/);
  assert.match(fields, /updateHome\("image"/);
  assert.match(fields, /blocks:v\.blocks/);
  assert.match(fields, /PackageMedia/);
});

test("new gallery cover replaces original homepage image across views", () => {
  const home = read("src/features/home/sections/destination-showcase.tsx");
  const list = read("src/features/packages/sections/package-cards.tsx");
  const details = read("src/features/packages/sections/package-details.tsx");
  const page = read("src/features/packages/sections/package-public-page.tsx");
  assert.match(home, /item\.images\[0\] \|\| feature\.image/);
  assert.match(list, /item\.images\[0\] \|\| item\.details\.home\?\.image/);
  assert.match(details, /item\.details\.home\?\.image/);
  assert.match(page, /record\.details\.home\?\.image/);
});

test("new Singapore itinerary provides travel-document guidance without inventing airfare", () => {
  const singapore=offers.find((item)=>item.slug === "singapore-signature-city-gardens-culture");
  assert.ok(singapore);
  const words=singapore.details.blocks.map(x=>x.runs.map(r=>r.text).join("")).join(" ");
  assert.match(words, /Gardens by the Bay/);
  assert.match(words, /Sentosa/);
  assert.match(words, /Kampong Gelam/);
  assert.match(words, /SG Arrival Card/);
  assert.match(words, /Nigerian passport holders need a Singapore entry visa/);
  assert.match(words, /full price before payment/);
  assert.equal(singapore.priceAmount,null);
});
