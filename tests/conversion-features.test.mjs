import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("floating WhatsApp widget is attached only to public layout and uses configured contact", () => {
  assert.match(source("src/components/layout/marketing-layout.tsx"), /<FloatingWhatsApp/);
  const widget = source("src/features/contact/components/floating-whatsapp.tsx");
  const link = source("src/lib/whatsapp-link.ts");
  assert.match(widget, /aria-expanded/);
  assert.match(widget, /Escape/);
  assert.match(widget, /noopener noreferrer/);
  assert.match(link, /brand\.phone\.replace/);
  assert.match(link, /encodeURIComponent\(message\)/);
});

test("homepage promotion respects dismissal and avoids fake flight fares", () => {
  assert.match(source("src/app/page.tsx"), /<TravelOfferPopup/);
  const promo = source("src/features/home/components/travel-offer-popup.tsx");
  assert.match(promo, /showModal/);
  assert.match(promo, /sessionStorage/);
  assert.match(promo, /onError/);
  assert.match(promo, /aria-label="Close travel offer"/);
  assert.match(promo, /\/api\/public\/banner/);
  assert.match(promo, /banner\.href/);
  assert.doesNotMatch(promo, /discountPercent|fakeFare|guaranteed discount/);
});

test("package share supports native share, WhatsApp, clipboard and manual fallback", () => {
  assert.match(source("src/features/packages/sections/package-details.tsx"), /<PackageShare/);
  assert.match(source("src/features/packages/sections/package-cards.tsx"), /<PackageShare/);
  const share = source("src/features/packages/components/package-share.tsx");
  for (const pattern of [/brand\.website/, /navigator\.share/, /navigator\.clipboard/, /https:\/\/wa\.me\/\?text=/, /readOnly/]) assert.match(share, pattern);
});

test("visa guide links to real authorities and doesn't promise approvals", () => {
  assert.match(source("src/app/visa-assistance/page.tsx"), /<VisaRequirements/);
  const guide = source("src/features/visa-assistance/sections/visa-requirements.tsx");
  for (const host of ["gov.uk", "canada.ca", "home-affairs.ec.europa.eu", "u.ae"]) assert.ok(guide.includes(host));
  assert.match(guide, /does not guarantee/);
  assert.match(guide, /<details/);
  assert.match(guide, /\/request\?service=visa/);
});

test("package cards do not assert unverified Lagos departures", () => {
  assert.doesNotMatch(source("src/features/packages/sections/package-cards.tsx"), /Lagos departure/);
});
