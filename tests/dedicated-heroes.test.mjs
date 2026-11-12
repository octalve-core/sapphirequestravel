import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

const heroes = [
  ["src/app/about/page.tsx", "hero-about.webp"],
  ["src/app/services/page.tsx", "hero-services.webp"],
  ["src/app/packages/page.tsx", "hero-packages.webp"],
  ["src/app/visa-assistance/page.tsx", "hero-visa.webp"],
  ["src/app/destinations/page.tsx", "hero-curated-travel.webp"],
  ["src/app/contact/page.tsx", "hero-contact.webp"],
  ["src/features/request/sections/request-section.tsx", "hero-request.webp"],
];
test("seven targeted pages have unique hero images and deep overlay", () => {
  assert.equal(new Set(heroes.map(([, name]) => name)).size, 7);
  for (const [path, name] of heroes) {
    const s = read(path);
    assert.ok(s.includes('image="/images/' + name + '" overlay="deep"'), path);
  }
});
test("darkening is scoped; other internal heroes can keep standard overlay", () => {
  const s = read("src/components/layout/page-hero.tsx");
  assert.match(s, /bg-black\/80/);
  assert.match(s, /bg-black\/60/);
  assert.match(s, /overlay === "deep"/);
  assert.match(s, /overlay = "standard"/);
});
test("additional public heroes use the same deep overlay", () => {
  for (const page of ["corporate-travel", "terms", "privacy"]) {
    const s = read("src/app/" + page + "/page.tsx");
    assert.match(s, /overlay="deep"/, page);
  }
  assert.match(read("src/features/home/sections/hero.tsx"), /bg-\[#063779\]\/80/);
});

test("home hero and supplied images are not overwritten", () => {
  assert.match(read("src/features/home/sections/hero.tsx"), /hero-runway\.webp/);
  assert.doesNotMatch(read("src/features/home/sections/hero.tsx"), /hero-(about|services|packages|visa|curated-travel|contact|request)\.webp/);
});
