# Sapphire Quest package workflow — release handover (Nov 2026)

## Scope / design
- Public cards: prominent travel photograph (once staff uploads), concise title, destination, trip length, verified rating only when real reviews exist, starting per-adult sharing price, Get quote and View trip.
- Public details: at-a-glance icon tiles, inclusions, itinerary, embedded package-specific quote form. No redirect to the unrelated general travel enquiry wizard.
- Public forms: ask exact intended package, date, departure city, adult/child/infant counts, contact details, optional requests and privacy consent. Server validates package is currently public, travel date, traveller limits and origin. No payment is taken or reservation claimed.
- Staff: /admin/package-enquiries is separate from /admin/enquiries; search, package, status, submission-date filters, pagination, real counts, role-protected Excel CSV export, detail timeline, status/assignee/notes with audit events.
- Package studio: /admin/packages is the package directory, /admin/packages/new and /admin/packages/[id]/edit are full-width forms. Staff can change price, photo gallery, details and verified rating.
- Customer data is stored in a dedicated package_enquiries table, with immutable package title, currency and from-price snapshot at time of inquiry. Never hide or overwrite the old general enquiries table.

## Required database preparation BEFORE enabling this feature in production
The connected Neon account currently visible to ChatGPT is NOT the verified Sapphire Quest production project. Do not execute this migration in an unrelated Neon project.
1. Identify the exact production Neon project from Sapphire Quest's Vercel DATABASE_URL hostname (do not expose the secret). Confirm the project/branch/database in Neon.
2. Take a successful, testable database snapshot/backup of that production branch.
3. Open the correct Neon SQL Editor and run db/migrations/002_package_workflows.sql. This is additive only: adds evidence-backed rating columns to travel_packages and creates package_enquiries plus package_enquiry_events, with indexes.
4. Verify the tables and indexes exist and that older general enquiries and package rows remain unchanged.
5. Only then merge/deploy this branch; submitting a new package quote before the table exists will correctly return an error, rather than claiming success.
6. Run one test enquiry with test contact details, inspect new table + staff detail + event timeline, test status/assignment/note, export a filtered CSV, check notification and delete test data only through an approved maintenance process.
7. Verify packages using real ratings have real source documentation and count, and photos are genuine/approved.

## Ratings integrity
Do NOT invent reviews or initialize every package at five stars. The existing five festive packages start unrated. A rating appears only when admin supplies a valid average score 1–5, a genuine review count of at least 1, and a descriptive feedback source (minimum 12 characters). The rating remains manually editable in the full-page editor. Never imply reviews or testimonials from customers who have not actually used an experience.

## Excel export
Exports are UTF-8 BOM CSV compatible with Excel, not native XLSX; all filters apply to the export, a 5,000-record cap avoids large downloads, and dangerous spreadsheet formula prefixes are escaped before opening in Excel. The export is for owner/manager roles and contains personal contact data. Limit sharing of downloaded files.

## Quality gates
Run pnpm install --frozen-lockfile, pnpm run typecheck, pnpm run lint, pnpm test and pnpm run build. Visually inspect mobile, tablet and desktop. Confirm server-side RBAC, origin checks, rate limit, no cross-domain user data leaks, and anonymous POST returns a real persisted reference. Recheck current public package routes and their image processing before release.

## Independent origin of functionality
Inspired by the user-provided visual examples, but original Sapphire Quest brand, typography and pricing presentation remain. No competitor logos, fake ratings, copied user testimonials or unsupported package availability indicators.
