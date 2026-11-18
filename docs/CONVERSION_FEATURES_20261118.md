# Sapphire Quest public conversion and admin campaign controls
Updated 18 November 2026

This release includes floating WhatsApp chat, native sharing and WhatsApp sharing on package cards, verified-source visa guidance and FAQs, and the accuracy correction for unsupported Lagos departures. The travel promotion popup is now fully managed from ImageKit.

## Admin promotional banners

Manager and owner route: /admin/banners, linked in the existing sidebar. Staff can:
1. Upload JPG, PNG, or WebP up to 5 MB, using the same signed /api/admin/media/auth endpoint as packages. Landscape 16:9 is recommended. The ImageKit folder is /sapphirequest/banners/.
2. Change the image description (used as image alternative text) and choose a click-through destination from approved internal pages.
3. Publish or unpublish the banner. Publishing a new one removes the previous campaign's active status.
4. Refresh the banner library. ImageKit search index updates may lag behind writes for a short time.

Uploads are WEBSITE-UNPUBLISHED by default: their public ImageKit URLs may still be reachable directly, but the website does not display them in its popup unless their publication tag is active. This is not the ImageKit Enterprise feature for private draft assets. No file deletion occurs.

No new Neon migrations or environment variable names are required. The existing Sapphire Quest ImageKit PUBLIC and PRIVATE API keys must be configured, and the private key needs media read/write privileges. Secrets remain server-only. Without working ImageKit configuration, the admin receives an actionable error and the public site stays functional without a popup.

The public endpoint returns only the selected published banner URL, accessible description, size and approved internal destination. A 30-second backend media cache and provider metadata indexing can cause a short publication propagation delay. At most one popup is displayed; simultaneous publication by multiple administrators is not a supported workflow.

The popup uses a native dialog, focus containment, Escape, backdrop click, once-per-session display, and a text-only fallback if an image is unavailable. No fabricated fares, booking inventory or discounts.

## Release verification

- CI: pnpm install --frozen-lockfile; pnpm run typecheck; pnpm run lint; pnpm test; pnpm run build.
- Check owner/manager versus agent/viewer and direct unauthenticated API access.
- Upload a genuine banner from admin and publish it. Check homepage, dismissal, subsequent visit, unpublish and new publication.
- Verify 320px, 375px, 768px, 1440px layouts and that WhatsApp and mobile navigation do not obstruct the popup.
- Check ImageKit outage behavior and official visa-information links.
- Merge the reviewed feature branch only after CI. Manually deploy one approved production SHA. No database migration is required.
