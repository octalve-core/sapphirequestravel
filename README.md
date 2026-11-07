# Sapphire Quest — Travel & Operations Platform

Premium, mobile-first travel agency website and private team workspace for Sapphire Quest Travels & Tours Ltd.

## Implementation status

Phase 1 ships a functional public site and agent-assisted travel enquiry workflow with a private administrative dashboard. **It does not sell, reserve or ticket live flights, guarantee visa outcomes, or charge customers online.** Live inventory and payments require contractual/provider approval and an additional production integration phase. Website can render marketing pages without Neon; enquiry submission and staff dashboard require an initialized Neon database.

## Stack

- Next.js 16 App Router, React 19, **strict TypeScript**
- Tailwind CSS v4 only (no CSS-in-JS or Bootstrap), `lucide-react`, shadcn-compatible UI tokens in `components.json`
- Geist font via `next/font/google`, body 400 / headings 500, restrained sapphire/navy/gold palette
- Neon PostgreSQL via `@neondatabase/serverless` (tagged, parameterized SQL)
- bcrypt-hashed staff passwords, revocable SHA-256 session tokens, HttpOnly/SameSite cookies, server-side RBAC, SQL audit trails
- Optional Resend email notifications (verified domain required)
- Vercel-ready, deployable from GitHub; Cloudflare can manage DNS without email-hosting conflicts

## Package management

Use **pnpm exclusively** for installation, scripts and dependency updates. Commit `pnpm-lock.yaml` and use `pnpm install --frozen-lockfile` in CI after the lockfile is generated. Do not introduce npm/yarn lockfiles or run npm install in this project.

## Local development

Requirements: Node 22+, **pnpm 10.34.9** (the sole package manager), a Neon project, and `.env.local` configured from `.env.example`.

```bash
pnpm install
pnpm dev
```

**Database:** Open the Neon SQL editor in a development branch and execute `db/schema.sql` once. Set a dedicated **pooled** `DATABASE_URL` in `.env.local` (not in Git). The schema uses `pgcrypto` for UUID generation. Use a distinct production Neon branch/database and apply the same reviewed migration.

**First staff owner:** after the schema exists, set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_NAME`, and a strong `ADMIN_PASSWORD` in a secure local shell, then run:

```bash
pnpm run bootstrap:admin
```

The bootstrap command refuses to create a second account. Remove the bootstrap variables from the shell afterward. Never add a hard-coded default admin, staff password or database URL to repository source. For additional staff, implement an audited invitation/password-reset workflow before operational rollout.

**Security configuration:** Set `RATE_LIMIT_SECRET` to a securely random value of 32+ characters. Cross-origin POSTs are rejected; enquiry submissions and sign-in use atomic Neon rate-limit buckets. Staff session tokens are stored as hashes in the database, revocable on logout. Plan for multi-factor authentication, password reset, verified account invitations, retention policy, consent review, abuse monitoring and security testing before broad production rollout. Use TLS end-to-end, backups and least-privilege DB credentials.

**Notifications:** Optional: `RESEND_API_KEY`, `NOTIFY_TO`, `NOTIFY_FROM` after validating the sending domain. Notifications contain only name, service and reference; sensitive itinerary details remain within the authenticated dashboard. Mail failure does not undo an accepted enquiry.

## Routes

Public: `/`, `/services`, `/destinations`, `/packages`, `/packages/[slug]`, `/visa-assistance`, `/corporate-travel`, `/about`, `/contact`, `/request`, `/thanks`, `/privacy`, `/terms`.

Staff: `/admin/login`, `/admin`, `/admin/enquiries`, `/admin/enquiries/[id]`, `/admin/packages`.

Mutations: `POST /api/enquiries`, `POST /api/auth/login`, `POST /api/auth/logout`, `PATCH /api/admin/enquiries/[id]`, `POST /api/admin/packages`, `PATCH /api/admin/packages/[id]`.

## Folder conventions

```
src/
  app/                     # routes and route handlers only
  components/layout/       # header, footer and shared page layouts
  components/ui/           # reusable primitives, shadcn-compatible
  features/home/sections/  # one file per homepage section
  features/booking/        # enquiry and search experiences
  features/admin/          # staff dashboard UI
  features/packages/       # published package views
  server/                  # DB, authentication, security, email and providers
  data/                    # typed curated content and airport labels
  config/                  # brand and navigation
  lib/                     # shared utilities
```

Rules: server-only DB/auth, no private keys shipped to clients, no dummy live fares, no payment or PNR issuance before provider authorization. Compose pages from independent sections, not one giant file. Responsive layouts begin at 320px. Images in `public/images/` are compressed from Sapphire Quest's project-provided creative assets; destination scenery is illustrative unless explicitly identified. The supplied official Sapphire Quest artwork is used for the header, footer and favicon.

## Provider integration roadmap

1. **Phase 1 (this repository):** Agent-assisted booking enquiries, visa assistance requests, group requests, staff workflow, published packages.
2. **Phase 2:** Contract a suitable flight-data provider. Candidate examples include **Duffel** (managed ticketing depending on onboarding and market) and **Amadeus Self-Service** (published-fare coverage and consolidator requirements). Add credentials only on the server; implement live search + reprice + transparent disclaimers. See `src/server/flight-provider.ts`.
3. **Phase 3:** Once permitted: airline ticketing/PNR, post-booking operations, refunds/cancellations, payment collection/webhooks, reconciliations, chargeback and fraud controls. Do not implement a pretend reservation or fake quote engine.

Travel agency regulatory status and supplier agreements must be verified. Not all airlines/inventory are available through every provider. Confirm Nigerian market eligibility, FX handling, consumer terms, data retention and applicable privacy requirements before production payment processing.

## Deployment and quality gates

CI runs typecheck, lint, unit tests and build. Deployment is best performed via Vercel linked to the GitHub repo. Configure environment variables and Neon pooled URI in the Vercel project **privately**. Point the domain to Vercel using Cloudflare DNS; preserve existing Zoho MX/SPF/DKIM/DMARC records. Do not turn on Cloudflare Email Routing for addresses hosted in Zoho. Verify a Preview deployment and API error handling before updating the production alias.

Manual pre-launch checks: keyboard & touch accessibility, 320px/768px/1440px layouts, Lighthouse performance, valid routes, admin RBAC, brute force protection, email delivery, DB backup recovery, legal terms/privacy review, actual company logo and CEO quote signoff. Production secrets are configured in Vercel, never committed to source; verify live Neon integration and staff onboarding before enabling customer operations.

© 2026 Sapphire Quest Travels & Tours Ltd.
