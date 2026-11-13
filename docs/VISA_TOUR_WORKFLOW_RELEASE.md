# Sapphire Quest: Connected Visa and Tours enquiry workflow
Date: 13 November 2026

## Customer UX and data architecture
The four existing tabs retain the common contact step and thank-you confirmation.

Visa: country and city (not airport); general visa preference; travel purpose; future date; travellers. The country list uses ISO 3166-1 alpha-2 codes. The GeoDB Cities API provides typeahead suggestions filtered to the selected country. The server handles API errors and permits visibly-labelled manual city entry rather than falsely claiming that a city was validated. Submitted records go ONLY to new visa_enquiries and visa_enquiry_events, with dedicated visa admin, filters, notes, status, assignment, audit, export and notifications.

Tours: display published real packages from the same catalogue used by the main website. Select a package; view image, summary, high-level inclusions and a price if available. Responsive desktop modal/mobile bottom sheet allows users to continue within the enquiry wizard or open the full package details. Travel date, departure city and a real adult/child/infant count are collected. The existing package enquiry endpoint stores submissions in package_enquiries; not in general enquiries. The package must still be published at submission time.

Flights and Corporate: unchanged original endpoints and records.

## Geographic sources and realistic limitations
- UN M49 country and ISO 3166 codes: https://unstats.un.org/unsd/methodology/m49/overview
- GeoDB city search filtered by country IDs and name prefix: https://geodb-cities-api.wirefreethought.com/docs/api/find-places
- GeoDB authentication/free API documentation: https://geodb-cities-api.wirefreethought.com/docs/guides/getting-started/authentication

GeoDB free endpoints can be rate-limited or temporarily unavailable. The frontend debounces queries, the server uses a time limit and caching, and manual city entry is allowed with a human verification note. If traffic increases, consider a licensed provider plan or a compliant maintained cities dataset. City suggestions are for travel planning, not immigration eligibility.

## Mandatory database migration and production release gate
Do NOT deploy this branch to live before migration 003 has been applied. The connected Neon account available to ChatGPT has not verified this Sapphire Quest project, so no database SQL has been run.

1. Inspect the existing Sapphire Quest production DATABASE_URL host in Vercel without sharing the password. Identify the exact matching Neon project, database and production branch.
2. Take a restorable production backup or Neon branch snapshot.
3. Execute db/migrations/003_visa_enquiries.sql in the corresponding Neon SQL Editor. This creates new visa tables and indexes only.
4. Verify: SELECT to_regclass('public.visa_enquiries'),to_regclass('public.visa_enquiry_events');
5. Run pnpm install --frozen-lockfile, pnpm run typecheck, pnpm run lint, pnpm test and pnpm run build. Then merge the reviewed PR and deploy one main SHA.
6. Test Visa on /request?service=visa and Tours on /request?service=holiday and on the homepage tabs, at mobile and desktop sizes. Confirm city reset when country changes, responsive preview, and real results.
7. Using controlled test details, submit one visa enquiry and one tour package enquiry, check they appear ONLY in their separate admin directories, test export, assignment, notes, status and notification links.
8. Restrict downloaded CSV files because they contain customers' personal details. No payment/visa issuance is claimed by these enquiry requests.

## Data preservation
Old general and package enquiry records, URLs, company pages and packages are untouched. Only one additive migration is needed. Do not apply migration to unrelated databases.
