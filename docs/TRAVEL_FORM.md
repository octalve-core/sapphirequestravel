# Sapphire Quest — Enquiry journey

The public booking panel is an agent-assisted travel enquiry, not a live ticketing checkout.

## Customer flow

- **Flights:** round trip, one way or 2–5 multi-city legs; airport search, travel dates, cabin class, adults/children/infants, direct-only and ±3-day preferences.
- **Visa:** destination airport, intended travel date, traveller count and visa purpose.
- **Tours:** destination airport, proposed start date, traveller count and tour style.
- **Corporate travel:** destination airport, proposed travel date, group size, travel type and optional organisation.
- All services lead to the same **Contact details** step; going back retains the selections.

The labels and options are defined in `src/features/booking/lib/service-options.ts`. The non-flight fields live in `src/features/booking/components/service-request-fields.tsx`; flight routes and shared contact state are orchestrated by `enquiry-wizard.tsx`.

## Data contract

`/api/enquiries` checks the payload with `src/server/enquiry-schema.ts`. `flightRequest` and `serviceRequest` are optional for older clients, but the upgraded frontend sends the matching structure. The server verifies option types, dates, counts and that top-level destination/date/traveller fields match the details. A successful request inserts the enquiry and its creation event together. The human-readable service summary is saved into `enquiries.notes` for existing admin views; destination/date/count also populate their existing columns. **No production migration is required.**

Both API and form must be updated together when adding fields. Ensure optional contact notes stay optional on every service. Do not hardcode airline prices or suggest that live tickets can be purchased.

## Verification

Use **pnpm only**:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm exec tsx scripts/check-flight-enquiries.ts
pnpm run build
```

Review desktop and small-screen widths, especially tab labels, airport suggestion popovers, swap-button spacing, passenger controls and the one-way/return/multi-city transitions. Submit one test request per service and confirm the admin displays the exact information selected, including optional organisation and contact notes. Use a test Neon branch for exploratory submission testing.
