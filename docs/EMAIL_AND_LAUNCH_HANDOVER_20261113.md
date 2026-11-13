# Sapphire Quest — Email notifications & client handover
13 November 2026. Applies to www.sapphirequesttravel.com.

## Email design and workflow
Two branded responsive, accessible transactional HTML emails and text fallbacks: (1) customer acknowledges a saved enquiry, reference and follow-up; (2) staff alert links to protected admin with client name, service and reference. The verified company logo is loaded from the website. No third-party fonts, trackers or customer documents in staff email. Email delivery is best effort and happens only after the DB accepts an enquiry. This is not a booking or visa approval.

To see both without sending:
```powershell
pnpm install --frozen-lockfile
pnpm exec tsx scripts/render-email-previews.ts
start .email-previews\customer-confirmation.html
start .email-previews\staff-notification.html
```

## Essential — keep Zoho receiving, add Resend outbound
1. Test inbound/outbound from info@sapphirequesttravel.com in Zoho. Keep the working root-domain MX, SPF, DKIM, DMARC and users. Do not replace apex MX with Resend or publish duplicate root SPF.
2. At https://resend.com/domains add **notify.sapphirequesttravel.com** as a *sending-only subdomain*. Copy precisely its displayed DKIM and SPF/return-path DNS records into the DNS provider hosting sapphirequesttravel.com; record values vary by project. Do not guess or create random MX values. Wait for Verified.
3. In Resend create a send-only API key. Set the following **Vercel Production** environment variables without exposing values in public GitHub or chat:
   - RESEND_API_KEY = Resend key
   - NOTIFY_FROM = Sapphire Quest <notifications@notify.sapphirequesttravel.com>
   - NOTIFY_TO = info@sapphirequesttravel.com
   - NOTIFY_REPLY_TO = info@sapphirequesttravel.com
   - CUSTOMER_ACKNOWLEDGEMENTS = false initially, then true only after you test customer delivery.
4. Redeploy the single approved main SHA. Submit a controlled Flight test using your own email. Confirm saved admin record and staff message using the Resend Emails/Logs dashboard. Set customer acknowledgements true, redeploy and repeat. Verify replies arrive at Zoho, subject, logo, reference, responsive display, and spam status. Repeat controlled tests for Visa, Tours, Corporate.
5. Remember: a 201 enquiry response is proof of database persistence, NOT proof an email reached an inbox. Inspect Resend activity for rejected/bounced/delayed events. Keep a low initial send volume.
Official: https://resend.com/nextjs ; https://resend.com/features/email-api ; https://www.zoho.com/mail/help/adminconsole/spf-configuration.html

## Essential — Neon + security
- Check the Vercel DATABASE_URL host against the correct existing Sapphire Quest Neon production project and branch; never paste the password. Confirm migrations 001, 002, 003 and backup/restore viability. No new schema migration for email.
- Check RATE_LIMIT_SECRET is a strong secret of 32+ characters in Production; never share or commit it. Verify admin session security, role restrictions, protected CSV export and backups.
- Test actual submissions in their specific workspaces: Flight and Corporate in /admin/enquiries; Visa in /admin/visa-enquiries; Tours/Packages in /admin/package-enquiries. Check status/assignment/export/audit/notifications.

## Essential if staff need direct image upload — ImageKit
1. In ImageKit Dashboard obtain the **Public API Key** and **Private API Key**.
2. Set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY in Vercel Production; private key must remain server-only. Redeploy.
3. Login as owner/manager, open /admin/packages, upload a JPG/PNG/WebP under 5 MB to a test package, save and verify the image from the resulting HTTPS URL on public package cards and details. The admin upload auth route signs a two-minute token; only authorised staff receive it. Check usage quotas.
4. Without ImageKit keys, staff can still paste legitimate HTTPS image URLs; browser uploads will report not connected. No need to invent a CDN URL or additional key.
Reference: https://imagekit.io/docs/integration/javascript

## Optional — Amadeus (airport suggestions only)
- The app already uses a local worldwide airport dataset; core forms work without Amadeus. To improve autocomplete, create legitimate Amadeus Self-Service API credentials, set AMADEUS_CLIENT_ID, AMADEUS_CLIENT_SECRET, AMADEUS_ENVIRONMENT=test as server-only Vercel variables, redeploy and search airports.
- These credentials do **not** enable live airfares, flight booking, PNR issuance, ticket payments or supplier settlement. Such capabilities are not implemented or sold as live.

## Domain, Zoho and search launch
- Confirm apex/WWW HTTPS, Vercel verification, SSL, canonical tags, robots.txt and sitemap.xml. Keep a 301 redirect from the prior misspelled domain if it remains owned, to protect existing links.
- Verify Zoho mailboxes and any former-address aliases still receive mail for the transition. Neon login under support@sapphirequestravel.com is independent of website DNS, but maintain reception on that legacy address until the Neon login email is changed and verified in the Neon account.
- Add https://www.sapphirequesttravel.com/sitemap.xml to the verified Google Search Console property. Check published package detail URLs can be indexed.
- Test mobile and desktop: navigation, SEO metadata, packages, booking tabs, login, secure exports, uploads, mail deliverability and page responsiveness.

## Delivery signoff
1. CI: pnpm run typecheck, pnpm run lint, pnpm test, pnpm exec tsx scripts/check-flight-enquiries.ts, pnpm exec tsx scripts/check-email-templates.ts, pnpm run build.
2. Resend verified domain + staff/customer test emails; Zoho replies; ImageKit test upload; Neon backup; all four enquiry categories; permissions and CSV export; SEO/SSL/redirect checks.
3. Production deploy should use a single reviewed and CI-passing main SHA.

Verification boundary: the connected Vercel team currently does not expose the Sapphire Quest project to this assistant, so live environment key presence cannot be confirmed from its connector. No production API credentials were read or modified during this email design work.