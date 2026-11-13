import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const stat = (path) => statSync(new URL("../" + path, import.meta.url));

test("About page composes story, mission/vision, values and CEO in deliberate order", () => {
  const page = read("src/app/about/page.tsx");
  const components = ["<AboutStory />", "<MissionVision />", "<CoreValues />", "<CeoMessage />", "<FinalCTA />"];
  let index = -1;
  for (const component of components) {
    const next = page.indexOf(component);
    assert.ok(next > index, component + " must follow earlier sections");
    index = next;
  }
  assert.match(page, /features\/about\/sections\/mission-vision/);
  assert.match(page, /features\/about\/sections\/core-values/);
});

test("mission and vision retain approved company wording with accessible headings", () => {
  const source = read("src/features/about/sections/mission-vision.tsx");
  assert.match(source, /To make travel simpler through clear advice, dependable coordination/);
  assert.match(source, /each traveller&apos;s purpose/);
  assert.match(source, /trusted travel-management partner known for attentive service/);
  assert.match(source, /international outlook/);
  assert.match(source, /<Target/);
  assert.match(source, /<Eye/);
  assert.match(source, /aria-labelledby="mission-vision-heading"/);
  assert.match(source, /alt=""/);
  assert.ok(stat("public/images/hero-curated-travel.webp").size > 15000);
});

test("values use only the three existing corporate principles", () => {
  const source = read("src/features/about/sections/core-values.tsx");
  for (const text of [
    "Integrity", "Precision", "Service",
    "Clear information and responsible advice",
    "Attention to travel requirements and documentation",
    "Respectful communication and client-focused support",
  ]) assert.ok(source.includes(text), text);
  assert.match(source, /aria-labelledby="core-values-heading"/);
  assert.match(source, /md:grid-cols-3/);
  assert.match(source, /values\.map/);
});

test("CEO feature retains supplied headshot, entire message and identity", () => {
  const source = read("src/features/about/sections/ceo-message.tsx");
  for (const text of [
    "ceo-portrait.webp", "hero-runway.webp", "Dr. Aderonke A. Akerele",
    "Chief Executive Officer", "Sapphire Quest Travels &amp; Tours Ltd",
    "Every journey begins with a purpose", "connecting people to opportunities",
    "personalised travel solutions", "international conferences and institutional engagements",
    "meaningful client relationships",
  ]) assert.ok(source.includes(text), text);
  assert.match(source, /<blockquote/);
  assert.match(source, /alt="Portrait of Dr\. Aderonke A\. Akerele, Chief Executive Officer"/);
  assert.match(source, /aria-labelledby="ceo-message-title"/);
  assert.ok(stat("public/images/ceo-portrait.webp").size > 30000);
});

test("About sections have readable HTML rather than flattened reference screenshots", () => {
  const sources = [
    read("src/features/about/sections/mission-vision.tsx"),
    read("src/features/about/sections/core-values.tsx"),
    read("src/features/about/sections/ceo-message.tsx"),
  ];
  for (const source of sources) {
    assert.match(source, /<section/);
    assert.match(source, /<h2/);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML|iframe|unoptimized/);
  }
  assert.match(sources[0], /bg-\[#06162e\]\/80/);
  assert.match(sources[2], /bg-\[#020914\]\/88/);
});
