# Public conversion features — 18 November 2026

This release adds only public-side features, with no new database tables, secrets, provider bookings or payment requests.

- Floating WhatsApp contact widget: shown in MarketingLayout only. Configured Sapphire Quest number, purpose-specific prefilled messages, keyboard dismissal and accessible controls.
- Homepage travel campaign: native modal shown after a short delay once per browser session; dismissible via close button, Escape and backdrop. Artwork path /images/sapphire-quest-travel-banner.webp (adapted from user-provided Sapphire Quest campaign). Text-only designed fallback if image is unavailable. Links to the actual /request form; never claims a ticket or fare.
- Share travel packages: native share where supported, clipboard or manual fallback, plus direct WhatsApp sharing, using the canonical domain from src/config/brand.ts.
- Visa guidance: official government links for UK, Canada, Schengen and UAE, case-dependent document notes, native accessible FAQ details, no guarantees or unsupported immigration promises.
- Accuracy fix: package cards no longer imply every package departs from Lagos.

Release process: verify campaign artwork is present and matches the supplied Sapphire Quest image before launch. Review the official visa links periodically; government rules can change. Test on mobile and desktop, keyboard, Escape, repeat homepage visits, share fallback on desktop, no admin exposure, and no overlap with mobile navigation.

Run pnpm install --frozen-lockfile, pnpm run typecheck, pnpm run lint, pnpm test, pnpm run build, preview at 320/375/768/1440 widths, then deploy one reviewed main SHA manually after CI passes.
