import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const stat = p => statSync(new URL('../' + p, import.meta.url));

test('real company-supplied artwork is used on light and dark surfaces', () => {
  const brand = read('src/components/ui/brand-mark.tsx');
  assert.match(brand, /sapphire-quest-on-light\.png/);
  assert.match(brand, /sapphire-quest-on-dark\.png/);
  assert.doesNotMatch(brand, /<Plane/);
  assert.ok(stat('public/branding/sapphire-quest-on-light.png').size > 0);
  assert.ok(stat('public/branding/sapphire-quest-on-dark.png').size > 0);
});

test('final CTA uses live HTML over a text-free cropped photo and links into real enquiry flow', () => {
  const cta = read('src/features/home/sections/final-cta.tsx');
  assert.match(cta, /cta-airport-lounge\.webp/);
  assert.match(cta, /bg-\[#032867\]\/65/);
  assert.doesNotMatch(cta, /backdrop-blur-xl/);
  assert.match(cta, /min-h-\[330px\]/);
  assert.match(cta, /A journey worth looking forward to/);
  assert.match(cta, /href="\/request"/);
  assert.ok(stat('public/images/cta-airport-lounge.webp').size > 0);
});


test('admin login and sidebar use the same official header logo component', () => {
  const component = read('src/components/ui/brand-mark.tsx');
  const sidebar = read('src/features/admin/components/admin-shell.tsx');
  const login = read('src/features/admin/sections/login-screen.tsx');
  assert.match(component, /href=\{href\}/);
  assert.match(sidebar, /<BrandMark compact href="\/admin"\s*\/>/);
  assert.match(sidebar, /bg-white px-3 py-2/);
  assert.match(login, /<BrandMark\s*\/>/);
  assert.doesNotMatch(login, /<Plane/);
});


test('homepage service and destination headings match the compact editorial scale', () => {
  const services = read('src/features/home/sections/service-overview.tsx');
  const destinations = read('src/features/home/sections/destination-showcase.tsx');
  assert.match(services, /text-\[clamp\(1\.44rem,2\.76vw,2\.7rem\)\]/);
  assert.match(destinations, /text-\[clamp\(1\.41rem,2\.88vw,2\.7rem\)\]/);
  assert.match(services, /Travel services, shaped/);
  assert.match(destinations, /Where will life take you\?/);
});


test('premium footer uses real navigation and Octalve developer credit', () => {
  const footer = read('src/components/layout/footer.tsx');
  assert.match(footer, /Octalve Holding/);
  assert.match(footer, /https:\/\/www\.octalve\.com/);
  assert.match(footer, /font-medium text-\[#2886ff\]/);
  assert.doesNotMatch(footer, /Travel, thoughtfully arranged\./);
});

test('homepage alone uses the sapphire overlay and service cards use image gallery', () => {
  const hero = read('src/features/home/sections/hero.tsx');
  const internal = read('src/components/layout/page-hero.tsx');
  const services = read('src/features/home/sections/service-overview.tsx');
  assert.match(hero, /bg-\[#063779\]\/60/);
  assert.match(internal, /bg-black\/60/);
  assert.match(services, /images\.unsplash\.com/);
  assert.match(services, /group-hover:scale-\[1\.075\]/);
  assert.match(services, /group-focus-visible:opacity-100/);
  assert.match(services, /sm:grid-cols-2/);
});
