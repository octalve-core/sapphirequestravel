## November 2026 — modular sections, packages, airport search and imagery

Each route in `src/app/` remains a **thin page composition**. Independent, testable presentation lives under `src/features/<page>/sections/*.tsx` (e.g. `features/about/sections/about-story.tsx`, `features/contact/sections/contact-options.tsx`). Shared design primitives stay in `components/`. The homepage enquiry uses a two-step `EnquiryWizard` and keeps the itinerary in component state while customers enter contact details; it submits to the existing `POST /api/enquiries` endpoint and never claims ticket issuance.

### Migration to apply before using the enhanced package editor

This release extends the **existing** `travel_packages` table without deleting records. In **Neon → SQL Editor → project sapphirequest_db → production → neondb**, review and run the whole file `db/migrations/001_enhanced_packages.sql` once. It adds price, currency, percentage discount, feature list, rich-text details, and image gallery fields; seeds **three private DRAFT example packages** (with no prices or availability claims). Use `SELECT title,status FROM travel_packages ORDER BY created_at DESC;` to confirm they appear. Re-running the migration does not duplicate the example slugs. It does not alter staff users or enquiries. If you choose not to run it yet, the admin package editor will show a migration-needed notice; legacy package pages continue rendering.

### Rich-text descriptions and images

The built-in safe editor supports bold, italic, headings, numbered and bulleted lists. Content is saved as a validated structured JSON document—not arbitrary HTML—and displayed using React nodes, preventing stored HTML execution. Feature bullets are entered one per line. Prices are optional and enquiry-led; discounts apply only to an entered base price, and the public page warns that quotes require confirmation.

Staff can supply **up to five** HTTPS image links. For direct media uploads, optionally register an [ImageKit](https://imagekit.io/) account and add `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_PRIVATE_KEY` to Vercel's **server-only** Production environment variables. Signed browser upload credentials are issued only for logged-in owners/managers, are short-lived, and private keys are never exposed to the browser. Uploads accept JPG, PNG or WEBP up to 5 MB per file. If no photo is attached, the official Sapphire Quest emblem is used. ImageKit configuration is optional; the editor remains usable without it.

### Airport autocomplete

The airport picker queries a server-only `/api/airports?q=` adapter and allows origin/destination selection without navigating away from the homepage. By default it offers a **curated shortlist** of common airports, expressly labelled as such. For Amadeus Airport & City Search, set `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` on Vercel and `AMADEUS_ENVIRONMENT` to `test` or `production` as licensed. Test data is *not complete or necessarily live*. No credential is included in this repository. IATA's official location database is a separately licensed subscription dataset; we do not assert access to an official live IATA API. Keep live airfares, ticket issuance and payment features disabled until travel supplier and legal onboarding.

### Local development using pnpm only (Windows PowerShell)

```powershell
git pull origin main
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm dev
```

The local website runs at `http://localhost:3000`. Database-dependent routes need `DATABASE_URL` and `RATE_LIMIT_SECRET` in a **local ignored** `.env.local`. Configure Vercel Production environment variables separately and never commit credentials. If no new migration has been applied, run it in Neon before testing package create/edit. For all future work, use a feature branch and test locally before pushing to GitHub and Vercel.
