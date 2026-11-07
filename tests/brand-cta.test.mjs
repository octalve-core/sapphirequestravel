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
  assert.match(cta, /backdrop-blur-xl/);
  assert.match(cta, /A journey worth looking forward to/);
  assert.match(cta, /href="\/request"/);
  assert.ok(stat('public/images/cta-airport-lounge.webp').size > 0);
});


test('admin login and sidebar use the same official header logo component', () => {
  const component = read('src/components/ui/brand-mark.tsx');
  const sidebar = read('src/features/admin/components/admin-shell.tsx');
  const login = read('src/app/admin/login/page.tsx');
  assert.match(component, /href=\{href\}/);
  assert.match(sidebar, /<BrandMark compact href="\/admin"\s*\/>/);
  assert.match(sidebar, /bg-white px-3 py-2/);
  assert.match(login, /<BrandMark\s*\/>/);
  assert.doesNotMatch(login, /<Plane/);
});
