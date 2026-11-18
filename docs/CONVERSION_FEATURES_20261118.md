# Sapphire Quest conversions, campaign scheduling, media editor
Updated November 18, 2026

## Public marketing
- Floating WhatsApp support, package share links, and visa guidance linked to official sources remain unchanged.
- The promotional popup is available across the existing public MarketingLayout, never on admin pages.
- The popup requests a banner eligible for the visitor's current route. Only the selected public routes are eligible.
- Popup time settings: page delay 0/3/5/10/15/30 seconds; campaign start and expiry in West Africa Time (UTC+1); once per browser session per ImageKit file. Images preserve native aspect ratio; on mobile the dialog scrolls if required.
- Published, within time range, targeted to the page is required to display. Images missing/expired/unpublished or provider failure never block the public website.
- Multiple published campaigns can coexist (for instance one on Visa and another on Packages). On overlap, the most recently updated eligible campaign is selected. The banner button destination is separately configurable from pages displayed.

## Admin: /admin/banners (owner/manager only)
- Upload brand artwork to ImageKit's private admin account, website-unpublished initially. Do not confuse this with making the ImageKit image URL private.
- Preview, edit image description, CTA destination, one or more public page targets, start/end schedule in WAT, display delay and publish/unpublish.
- "Replace image": upload a NEW file with the current card settings as an unpublished draft. The previous image and current published campaign stay intact until the manager publishes the replacement. Delete the old file separately.
- "Delete image": a separate button requiring browser confirmation; authenticated, same-origin API validates that the file is a regular image in /sapphirequest/banners/ before permanent ImageKit DELETE. This is irreversible.
- Settings stored as ImageKit media tags; no new Neon migrations or new environment keys. Existing banner lacking config tags defaults to Homepage, no date limit and a 3-second delay. Existing user-uploaded images can be edited.
- ImageKit API key must have Media Library read/write rights. Metadata indexing and server cache may briefly delay publication updates (public media cache revalidates within ~15 seconds). Concurrent staff changes can overwrite each other; avoid editing the same campaign simultaneously.

## Package media editor
- Each existing gallery image supports Replace (upload a new asset), Remove (detach from the package), Make package cover, and order arrows.
- Separate optional homepage-card image upload is available; "Use gallery cover" clears the override.
- All changes are drafts until Save package changes is submitted to the existing package API. The public package card uses the first gallery image; a separate homepage override can be used.
- Package removal deliberately DOES NOT delete the underlying ImageKit asset: a file may be shared by other pages or packages. Permanent deletion of referenced package files remains a separate media-cleanup concern. The user is informed in the editor.
- No database schema migration or destructive change to package enquiries.

## Verification
- CI: pnpm install --frozen-lockfile; pnpm run typecheck; pnpm run lint; pnpm test; pnpm run build.
- Manual checks: owner vs agent permission, invalid origin and invalid page/date, banner upload, publish, schedule start/end, browser-session frequency, replacement, deletion, multiple campaigns on separate pages, and verifying campaign doesn't appear in admin.
- Package test: upload replacement, make cover, remove from package then save and check actual public URL, including homepage override.
- Mobile checks at 320/375/768/1440px, keyboard focus and Escape; ImageKit outage behavior.
- Merge after CI, then follow existing manual production-deployment policy using one main SHA.
