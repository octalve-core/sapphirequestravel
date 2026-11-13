# Sapphire Quest — Connected Homepage Featured Packages

Status: operational package CMS integration, no Neon schema changes required.
Updated: 13 November 2026

## Experience architecture

The existing homepage component \`DestinationShowcase\` retains its original markup, photograph URLs, subtle lower gradient, corner radii, headings and responsive two-column grid. Only its source of destinations and link targets change: it now queries the same published package catalogue as /packages and links to /packages/[slug] instead of the unrelated generic request page. "Explore packages" leads to /packages.

The homepage shows at most four enabled, published, image-backed packages in ascending position order. The /packages listing continues to use the standard Sapphire Quest package card UI and the package details continue using the independent package-specific quote form.

## Four original homepage tiles

| Original tile name | Home caption | Original image | Linked package |
| --- | --- | --- | --- |
| Singapore | Southeast Asia | /images/singapore.webp | Singapore Signature — City, Gardens & Culture |
| Global connections | Dubai, United Arab Emirates | /images/global-routes.webp | Dubai After Dark — Festive Skyline Escape |
| Coastal escapes | Zanzibar, Tanzania | /images/coastal.webp | Zanzibar Azure — The Island Christmas Escape |
| Meaningful moments | Cape Town, South Africa | /images/travel-moment.webp | Cape Town Sunbound — Summer & Coast |

All four original image files remain in public/images. Generic imagery does not claim to represent a specific hotel or attraction. Existing Dubai/Zanzibar/Cape Town itinerary and advertised pricing are not changed.

## Singapore package editorial brief

New six-day/five-night Singapore Signature is a bespoke quotation-led journey with flights and hotel selected after the customer contacts Sapphire Quest. At the time of authoring, no supplier-contracted amount is verified; published pricing therefore remains null (Personalised pricing), not an invented discount or a fabricated airfare.

Itinerary: arrival and settling in; Marina Bay and Gardens by the Bay; Chinatown and Kampong Gelam; Sentosa Island; independent exploration including Little India/Singapore River; return departure. Inclusion outline: flights from Lagos, five nights' hotel, breakfast, transfers, guided city/culture and Gardens/Sentosa experiences, plus visa planning. The personalised quotation confirms inclusions before payment.

Official primary sources (checked November 2026):
- Singapore Tourism Board, sights/neighbourhoods: https://www.visitsingapore.com/
- Singapore Tourism Board, seven-day itinerary: https://www.visitsingapore.com/content/visitsingapore/en/travel-tips/travelling-to-singapore/itineraries/7-days-in-singapore
- Gardens by the Bay opening and closures: https://www.gardensbythebay.com.sg/en/plan-your-visit/opening-hours.html
- Singapore ICA visa rules (Nigeria requires visa, entry not guaranteed): https://www.ica.gov.sg/information-and-e-services/entry-and-departure/entering-singapore/visa-guidelines
- Singapore ICA SG Arrival Card within three days (free): https://www.ica.gov.sg/about-ica/news-and-publications/public-advisories/visiting-singapore

No competitor content, images, reviews or rates are reproduced. Tour activities and opening hours must be reverified at booking.

## Editing via the existing admin, without copying or migrating tables

1. Log in as owner/manager on /admin/packages.
2. Use **Add curated packages to editor** once. It imports any of the six curated packages missing from your Neon package table, without overwriting existing rows or prices. The five original festive offers remain unchanged.
3. Open **Edit** on the relevant package. In **Homepage feature · Explore the possibilities**, change:
   - Homepage checkbox
   - Card title and location/caption
   - Display position (1–100)
   - Fallback image URL (original local image path or approved HTTPS URL)
4. Edit the full itinerary, prices and the package gallery in the usual full-page editor. Save.
5. If you upload new photos, put the preferred cover FIRST in Package photos. It overrides the original image on the homepage, standard /packages card, detail hero and the package gallery. The local image file remains in the repo but is no longer presented for that package.
6. To remove an item from the homepage, uncheck Featured and save. A draft package will not be featured even with the checkbox checked. To feature another package, upload a photo, enable the checkbox, set its position and save. Only the first four sorted packages show.

## Compatibility and safety

No SQL migration is required: existing travel_packages.details JSONB stores an optional \`home\` object. Old imported records that predate these fields are hydrated with the original seeded homepage settings until a member of staff explicitly saves them. An explicit \`enabled:false\` suppresses the fallback. All existing package enquiries, customer data and status workflows remain unchanged.

The rich-text editor normally emits \`{blocks}\` only; it is explicitly patched to retain \`details.home\` when text is edited. Existing asset URLs are retained and new uploads override originals only through CMS data, without deleting or renaming files. Public routing respects unpublished/draft packages.

The homepage uses dynamic server rendering to reflect staff updates immediately; monitor database connection and performance as traffic grows. No payment or confirmed inventory is created by featuring a package.
