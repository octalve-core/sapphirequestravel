# Sapphire Quest About page — design and content record
Date: 13 November 2026

## Source of truth
The supplied image references contained Mayport-like Mission/Vision cards and core-value icons, as well as three Sapphire Quest screenshots showing the company's current mission, vision, three values and CEO message. The implementation preserves Sapphire Quest's approved propositions and the existing CEO portrait without altering her appearance.

## Component architecture
About page composition: PageHero, AboutStory, MissionVision, CoreValues, CeoMessage, FinalCTA.

MissionVision uses semantic mission and vision articles over the existing hero-curated-travel.webp photograph, with a strong navy scrim. On desktop the white mission card is top right, and the vision card is lower left; on smaller screens they stack.

CoreValues keeps the exact three company principles: Integrity, Precision and Service. It uses modest blue line icons and individual white cards rather than adding unapproved values.

CeoMessage uses the original ceo-portrait.webp image on a restrained runway-photo/navy background. It includes the full original quote and four paragraphs from the user-provided CEO screenshot, with gold-accented executive attribution.

## Technical and UX considerations
All text is selectable HTML. The photogenic backgrounds are decorative images with empty alt text; the CEO portrait has a meaningful alt. Contrast treatments support readability. Responsive cards do not need client-side JavaScript. The About page's hero, footer, CTA, booking/API/database and other routes are preserved. No new files for images and no database migration are required.

References used:
- W3C WCAG contrast minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- Nielsen Norman Group on credible About-page content: https://www.nngroup.com/articles/about-us-information-on-websites/
- Next.js official responsive image handling: https://nextjs.org/docs/app/getting-started/images

CI: TypeScript, ESLint, tests and Next.js production build; visually review desktop/mobile About page after Vercel production release.
