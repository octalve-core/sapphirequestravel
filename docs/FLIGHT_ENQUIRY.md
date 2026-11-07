# Flight enquiry experience — Sapphire Quest

This feature takes a customer from journey selection to a tracked agent-assisted enquiry **without claiming a fare, booking, ticket, or reservation**.

- Trip modes: **round trip**, **one-way**, **multi-city** (2–5 flight legs). Dates are validated in order, and both locations on every leg must be explicitly selected.
- Cabin class: economy, premium economy, business, first; the preference is recorded for the agent (not confirmed inventory).
- Passenger ages: adults (12+), children (2–11), infants (under 2); maximum nine total, no more infants than adults.
- Optional preferences: direct only and flexible ±3 days; neither guarantees availability.
- Step two captures name, email, phone, optional comments and explicit privacy consent. Back navigation retains all flight selections.
- API validates all flight preferences, leg order and passenger counts. The readable full itinerary is stored in the **existing `enquiries.notes` field** for compatibility with the current production Neon schema. Staff can see each flight leg, class, headcounts and preferences in the enquiry detail screen. Existing one-way clients remain compatible. No database migration is necessary for this change.

## Airport data and limitations

OurAirports (https://ourairports.com/data/) is a public-domain community-maintained global airport directory. The repository includes an index of three-letter IATA-coded facilities, refreshed using `python scripts/refresh-airports.py` and committed to `src/data/airport-directory.json` via the dedicated GitHub workflow. The directory includes location **reference data**, not real-time flight availability or the official IATA location codes subscription. Distinct metropolitan areas (e.g. city codes), non-airport transport stations, and some code changes may not appear; staff must confirm the requested route with their ticketing supplier.

Optional Amadeus credentials (`AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`, `AMADEUS_ENVIRONMENT`) enable an additional airport search adapter. Test environment airport coverage is intentionally limited, so local directory matches remain available. The public endpoint `/api/airports` handles responses and search data; secrets never reach the client. The website still does **not** display live fares or process payments.

## Verification

Run `pnpm install --frozen-lockfile`, `pnpm run typecheck`, `pnpm run lint`, `pnpm test`, and `pnpm run build`. Test return/one-way/multi-city at mobile and desktop widths, keyboard suggestions, passenger limits, multiple legs with reversed dates, contact-form back navigation, and submitted data in `/admin/enquiries`.
