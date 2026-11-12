import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("navigation matches approved order and Explore submenu", () => {
  const brand = source("src/config/brand.ts");
  const labels = [...brand.matchAll(/\{ label: "([^"]+)", href: "[^"]+" \}/g)].map((x) => x[1]);
  assert.deepEqual(labels, [
    "Home", "About Us", "Services", "Packages", "Visa assistance",
    "Contact Us", "Corporate travel", "Packages",
  ]);
  const header = source("src/components/layout/header.tsx");
  assert.match(header, /primaryItems/);
  assert.match(header, /exploreItems\.map/);
  assert.match(header, /contactItem/);
});

test("header is sticky and mobile navigation uses a modal side panel", () => {
  const header = source("src/components/layout/header.tsx");
  const css = source("src/app/globals.css");
  assert.match(header, /sticky top-0/);
  assert.match(header, /\.showModal\(\)/);
  assert.match(header, /<dialog/);
  assert.match(header, /onClose/);
  assert.match(header, /mobile-nav-panel/);
  assert.match(header, /aria-expanded=\{mobileExploreOpen\}/);
  assert.match(css, /@starting-style/);
  assert.match(css, /prefers-reduced-motion/);
});

test("footer is pure black; branding, enquiries and notification mail use new address", () => {
  assert.match(source("src/components/layout/footer.tsx"), /bg-\[#000000\]/);
  assert.match(source("src/config/brand.ts"), /info@sapphirequesttravel\.com/);
  assert.match(source("src/app/api/enquiries/route.ts"), /info@sapphirequesttravel\.com/);
  assert.match(source("src/server/notifications.ts"), /notifications@sapphirequesttravel\.com/);
  assert.match(source(".env.example"), /NOTIFY_TO="info@sapphirequesttravel\.com"/);
  assert.match(source("src/features/admin/components/login-form.tsx"), /you@sapphirequesttravel\.com/);
  assert.doesNotMatch(
    ["src/config/brand.ts","src/app/api/enquiries/route.ts","src/server/notifications.ts","src/features/admin/components/login-form.tsx",".env.example"].map(source).join("\n"),
    /@sapphirequestravel\.com/,
  );
});

test("CEO section keeps exact supplied portrait and attribution", () => {
  const ceo = source("src/features/about/sections/ceo-message.tsx");
  assert.match(ceo, /ceo-portrait\.webp/);
  assert.match(ceo, /Dr\. Aderonke A\. Akerele/);
  assert.match(ceo, /Chief Executive Officer/);
});
