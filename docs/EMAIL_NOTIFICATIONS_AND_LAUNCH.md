# Sapphire Quest — email notifications and final integration handover

Status: implementation reviewed against repository on 13 November 2026.
Public site: https://www.sapphirequesttravel.com
GitHub repository: octalve-core/sapphirequestravel

## Email design and security

Implemented in src/server/email-templates.ts:
- Customer acknowledgement: premium light 600px layout with navy header, sapphire button, gold accent, reference number and receipt status. Plain text alternative; no images, third-party tracking or remote fonts. Explains that this is not a booking, ticket or visa approval.
- Staff alert: a separate message containing the reference, customer name and service only; linked to the authenticated General, Package or Visa Enquiries dashboard. Does not copy full itinerary or contact fields into email.
- Three existing enquiry APIs schedule notifications only AFTER a successful Neon write using Next.js after(). Mail failures do not turn accepted requests into failed submissions.
- Transport includes one idempotency key per reference/recipient type and a 4.5 second timeout, independent staff and customer sends, basic audit logs without tokens or private customer data.
- Customer confirmations are disabled by default and must be explicitly turned on after domain verification and test delivery. This is best effort delivery, not yet a durable outbox or webhooks/automatic retry queue.

## Zoho Mail — protect incoming mail

1. Go to the Zoho Mail Admin Console and confirm sapphirequesttravel.com is verified, and info@sapphirequesttravel.com receives external test messages.
2. Keep the exact Zoho MX records shown for your specific Zoho data centre in Domain > Email Configuration > MX. Never replace them with email-sending provider MX records on the root domain.
3. Keep your working Zoho root-domain SPF and DKIM, verify with Zoho, and monitor DMARC.
4. Do not convert an actively hosted domain into an alias without reviewing Zoho warning that accounts, groups and domain settings can be removed.
5. If support@sapphirequestravel.com or another old-domain address is still the Neon account login, keep its original mailbox or alias receiving mail until the account email has been explicitly changed and verified in Neon.

References:
https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html
https://www.zoho.com/mail/help/adminconsole/domain-options.html

## Resend — separate outbound transactional mail

1. In Resend (https://resend.com/domains) add sending domain: notify.sapphirequesttravel.com.
2. At your authoritative DNS host (Cloudflare if it still hosts DNS), add exactly the SPF, DKIM and bounce MX records RESEND shows for this subdomain, with DNS-only settings. Do not copy generic examples or alter the Zoho MX at @. Resend may use a hostname such as send.notify for its bounce return path; verify the exact names shown in the dashboard.
3. Wait for Resend to mark notify.sapphirequesttravel.com Verified.
4. Generate a Resend API key restricted to the correct sending domain when that key permission is supported; paste it only into the Sapphire Quest Vercel Production environment. Never send the key through chat or add it to GitHub.
5. Configure in Vercel Project > Settings > Environment Variables:
   RESEND_API_KEY = (secret value from Resend)
   NOTIFY_FROM = Sapphire Quest <notifications@notify.sapphirequesttravel.com>
   NOTIFY_TO = info@sapphirequesttravel.com
   NOTIFY_REPLY_TO = info@sapphirequesttravel.com
   CUSTOMER_ACKNOWLEDGEMENTS = false (initial test)
6. Redeploy the reviewed main SHA to Production. Vercel variables take effect only on new deployments.
7. Make one deliberately labelled controlled test enquiry with your own mailbox, then confirm the unique enquiry reference appears in the correct admin table and the staff alert in Resend.
8. Change CUSTOMER_ACKNOWLEDGEMENTS to true and redeploy; submit one NEW controlled test enquiry, then verify the staff email and customer email from an external inbox. Check reply-to reaches the Zoho info mailbox, not an unattended subdomain.
9. Inspect Resend Emails activity for delivered, bounced, rejected and delayed events; a successful enquiry API response does NOT guarantee email delivery. Investigate SPF/DKIM/DMARC and spam folder if missing.
10. Avoid mixing marketing campaigns into transactional sending; add separate domains/preferences for marketing later.

Provider docs:
https://resend.com/changelog/idempotency-keys
https://resend.com/guides/email/deliverability/why-emails-go-to-spam
https://resend.com/changelog/custom-return-path

## Vercel & Neon — preserve working infrastructure

Check variable NAMES only, never reveal secrets:
- DATABASE_URL (existing correct Neon pooled production connection)
- RATE_LIMIT_SECRET (32+ random bytes/characters, do not change without planning)
- RESEND_API_KEY, NOTIFY_FROM, NOTIFY_TO, NOTIFY_REPLY_TO, CUSTOMER_ACKNOWLEDGEMENTS
- IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY (optional staff uploads)
- AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET, AMADEUS_ENVIRONMENT (optional airport lookups).

Production should remain on existing GitHub main and the new correct www.sapphirequesttravel.com domain. Never create a second Neon project or change existing database host to activate email.

The currently connected Vercel tool only exposes a different Octalve-linked project, not Sapphire Quest project environment keys. Consequently ChatGPT has NOT accessed or modified Sapphire Quest production secrets.

Source: https://vercel.com/docs/environment-variables/managing-environment-variables

## ImageKit — the package editor is already wired, keys are the missing configuration

1. Open ImageKit dashboard > Developer options > API keys; create and identify Sapphire Quest public/private key pair.
2. Add IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY privately to the Sapphire Quest Vercel project Production environment. Never prefix private key with NEXT_PUBLIC.
3. Redeploy to pick up variables.
4. As owner/manager open /admin/packages/[id]/edit, then upload a genuine JPG, PNG or WebP under 5MB.
5. /api/admin/media/auth checks staff permissions and signs a 120-second upload token; the browser posts directly to ImageKit /sapphirequest/packages with the token. Check URL appears, save package and verify on public card. External HTTPS URLs remain a fallback if uploads are not yet enabled.
6. The browser handles the image itself; ImageKit private API key must never be in JavaScript or public files.

Source: https://imagekit.io/docs/integration/javascript

## Amadeus and flight booking — optional versus not yet built

- Airport picker already uses a local durable directory without any key. Amadeus credentials may enhance airports-only suggestions when appropriately enabled; keep the secret on the server.
- src/server/flight-provider.ts currently returns null. This means there are NO live fares, no automated holds, PNR/tickets, automated payments or refunds. Do not market them as live features.
- Ticketing must be a separately approved phase with provider contract, fare repricing, payment verification, bookings, cancellations, refunds, reconciliation, compliance and error recovery.

## Final signoff checks

1. Public requests: Flight and Corporate -> /admin/enquiries; Visa -> /admin/visa-enquiries; Tours / package quote -> /admin/package-enquiries. Confirm exact data saved and unique references.
2. Private admin: authentication, role filters, assignment, status, notes, CSV export and audit events. Do not expose CSV to unauthorised users.
3. Resend: staff and customer notifications tested from separate external inboxes; do not enable customer sends until verified.
4. Zoho: inbound/outbound info and support mailbox function; previous-domain mailbox continues where needed for third-party logins.
5. ImageKit: signed upload succeeds for manager and fails for anonymous staff; package editor only writes after explicit save.
6. Security: HTTPS, correct main production SHA, env secret isolation, origin checks, rate limits, Neon backup and restore, regular security review.
7. User experience: mobile/desktop layout, one package preview, real enquiry forms, image loading, no fake bookings, responsive forms and proper privacy data handling.
8. Performance/SEO: measure Lighthouse/Core Web Vitals and verify sitemap.xml, robots.txt, canonical URLs and redirect old-domain traffic only after its DNS/mail dependency review.
9. Optional future reliability: durable notification outbox, verified webhook delivery events and retries with ops visibility, and staff-password-reset/MFA workflow. These are NOT implied to be in the present code.
