# Sapphire Quest Reports & Insights — metric definitions

Implemented 14 November 2026. Owner/manager-only authenticated route: `/admin/reports`.

The report aggregates **saved enquiry submissions** from `enquiries`, `package_enquiries` and `visa_enquiries`. Legacy Visa and Tours requests that were submitted to General Enquiries remain counted once in General, labelled separately in the source mix. Dedicated visa/package submissions live only in their own tables. SQL uses bound 7/30/90/365-day rolling windows measured in UTC; previous period means the immediately preceding equal-length window. Do not sum percentages, treat growth as bookings or assume lead attribution beyond the service submitted.

Metrics: total submissions; distinct normalised contact email addresses; email addresses with two or more submissions; New and Active statuses; Confirmed and Closed statuses; open/unassigned; New still unreviewed after 48 hours; server-derived daily/weekly/monthly trend; demand by service; top requested package titles; most requested dedicated visa countries; workload by staff assignment and current status. Published and draft package counts describe the current catalogue (all-time) and are not affected by the period filter.

**Limitations:** This system does not record verified receipts, settled supplier costs, issued airline tickets, actual hotel bookings, visa decisions, website traffic or first response timestamps. A Confirmed status is staff-selected and is *not* a booking, payment or successful visa outcome. New for over 48 hours is a backlog proxy, *not* measured SLA breach. Email addresses are approximate contact identities; duplicate emails may not reflect individual persons.

The all-source owner/manager summary export includes aggregate figures only, with the existing Excel-safe CSV encoder and private/no-store response headers. No customer names, emails or phone numbers are included. All metric pages are server-rendered and no large charting dependency is required. The implementation follows compact shadcn-style card patterns and a lightweight HTML accessible table describing every bar in the chart.

**Prerequisites:** the existing Sapphire Quest Neon branch must have applied migrations 001, 002 and 003; this release adds no migrations, new tables, provider keys, environment variables or destructive writes. Blank and database-error states must not invent zero-valued actuals. To test: owner/manager should see Reports; agent/viewer should not see it in navigation and should receive a Not Found page when opening the route directly.

Release checks: TypeScript, lint, unit tests, `tsx scripts/check-report-math.ts`, full production Next build, then Vercel preview and production deploy of one main commit. For a final acceptance test, sign in as owner/manager and compare the report source totals with the filtered counts in each admin enquiry directory. Use the 30-day rolling range and avoid relying on screenshots of private data without consent.
