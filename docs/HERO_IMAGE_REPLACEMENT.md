# Sapphire Quest — Seven Dedicated Marketing Hero Images

Status: feature branch only; NOT ready to merge or deploy until seven approved user photos are added.

Exact filenames under public/images/:

| Page | Route | File |
| --- | --- | --- |
| About Us | /about | hero-about.webp |
| Services | /services | hero-services.webp |
| Packages | /packages | hero-packages.webp |
| Visa assistance | /visa-assistance | hero-visa.webp |
| Curated Travel / Explore | /destinations | hero-curated-travel.webp |
| Contact Us | /contact | hero-contact.webp |
| Let's get started / Request | /request | hero-request.webp |

Clarification: The existing wording 'Curated travel' is an eyebrow on the Packages hero, not a separate URL. The separate curated image is mapped to Explore/Destinations (/destinations) so there are seven distinct route heroes. The Packages page retains its own unique hero image.

Only the seven requested pages select overlay='deep' (80% black). The PageHero default remains 60% black for Corporate travel and package detail views. Home has its own blue overlay and is unchanged.

Recommended format: landscape WebP photographs, approximately 2400 x 1200 pixels, with a composition that remains legible under a dark overlay. Prefer an optimized photo ~250-700 KiB when image quality permits.

Never rename a JPEG or PNG file extension to .webp without actually converting its underlying format. Do not overwrite or delete the existing hero-runway, coastal, travel-moment, or singapore images because other site sections still use them.

Before merging: copy all seven properly converted images under public/images; run node scripts/check-hero-assets.mjs; then pnpm install --frozen-lockfile, pnpm run typecheck, pnpm run lint, pnpm test, pnpm run build; visually check mobile and desktop. Commit the images on this feature branch and merge only after all checks succeed.

No Neon database, bookings, company email, domain or admin workflows are changed.
