# Sapphire Quest — 13 November 2026 Booking & Contact Quality Pass

Scope: Remove non-client-facing copy on Visa/Tours, correct icon/input overlap across breakpoints, improve Corporate travel city and optional-airport input, refine contact panel, correct the visible CEO company attribution, add contextual SEO metadata and test affected security validations.

### Preserved functional contracts
- Visa still submits to /api/visa-enquiries and admin/visa-enquiries.
- Tours still selects published real packages and submits to /api/packages/[slug]/enquiries; desktop dialog and mobile sheet are unchanged.
- Flights continue using true airport IATA codes and the existing flight enquiries API.
- Corporate submits to general /api/enquiries and existing staff enquiry table with NO database migration. New structured corporate details: country code, city (mandatory), nearby airport IATA code (optional), date, traveller count, purpose. A readable city + country and optional airport snapshot are stored in the existing notes column and exposed on staff detail view. Submitted destination airport code is null if unset.
- City suggestions still use the GeoDB API and support manual entry when unavailable; data attribution moved to Privacy rather than displayed under every form. Licensed attribution link maintained.
- The CEO portrait and longer company message are preserved. Only the company display line beneath the name changes, per explicit request.

### Performance and UX
- Use the existing shared Next.js Image optimizations and public local images. Do not install a heavyweight map SDK or new API to suggest an airport; reuse the already bundled, local-first IATA lookup.
- Keep Visa and Corporate city suggestions debounced and abort stale in-flight lookups.
- Increase fixed CSS left padding on icon-bearing controls using a stronger .booking-input.booking-location selector rather than an easily overridden utility.
- Prevent optional-airport typing from appearing accepted unless the user selects a suggestion. Changing the corporate city clears a previous airport choice.
- Contact uses direct mail, phone, Instagram and WhatsApp links; no additional form, third-party tracker, unverified contact details or new DB writes.

### Security and SEO
- Server-side Zod validates corporate country from the ISO allowlist and safe Unicode city characters, preserves original same-origin checks and rate limiting, and prevents client bypass by requiring the corporate structured payload.
- Canonical URLs and unique descriptions for the About, Contact, Visa, Corporate and Request pages refer to the currently verified new domain.
- Retain existing HSTS, X-Frame-Options, permissions policy, no-sniff and referrer protections. Add a low-risk legacy cross-domain-policy block. Do not enable an untested blanket Content Security Policy that breaks Next.js hydration, Zoho, image delivery or admin sign-in.

### Research/reference
Next.js metadata: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
W3C form controls and accessible labels: https://design-system.w3.org/styles/forms.html
GeoDB license: https://wirefreethought.github.io/geodb-rest-api-docs/
W3C target size: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum

### QA
CI commands: pnpm install --frozen-lockfile; pnpm run typecheck; pnpm run lint; pnpm test; pnpm run build.
Production smoke checks: /contact, /about, /request?service=visa, /request?service=corporate, /request?service=holiday on desktop and mobile; no real submissions without designated test data.
