import { brand } from "@/config/brand";

/** Email-client-safe transactional templates: inline CSS, table layout, no remote fonts or trackers. */
export type EmailContent = { subject: string; html: string; text: string };
export type EnquiryMailData = {
  reference: string;
  name: string;
  service: string;
  dashboardPath?: "/admin/package-enquiries" | "/admin/visa-enquiries";
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function cleanLine(value: string, max = 110): string {
  return value.replace(/[\r\n\t\x00-\x1f\x7f]+/g, " ").trim().slice(0, max);
}

function serviceLabel(service: string): string {
  if (service === "flight") return "Flight enquiry";
  if (service === "visa" || service === "Visa assistance") return "Visa assistance";
  if (service === "corporate") return "Corporate travel";
  if (service === "holiday" || service === "Tours") return "Tours and packages";
  return cleanLine(service, 90) || "Travel enquiry";
}

function detailRow(label: string, value: string): string {
  return (
    '<tr><td style="padding:12px 0;border-bottom:1px solid #eaf0f7;color:#657590;font-size:12px;line-height:20px;width:38%;vertical-align:top;">' +
    escapeHtml(label) +
    '</td><td style="padding:12px 0;border-bottom:1px solid #eaf0f7;color:#071c3b;font-size:13px;line-height:20px;font-weight:600;vertical-align:top;word-break:break-word;">' +
    escapeHtml(value) +
    "</td></tr>"
  );
}

function shell(input: {
  preheader: string;
  eyebrow: string;
  heading: string;
  introduction: string;
  reference: string;
  rows: string;
  nextHeading: string;
  nextText: string;
  buttonText: string;
  buttonHref: string;
  footnote: string;
}): string {
  const site = escapeHtml(brand.website);
  const contact = escapeHtml(brand.email);
  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">',
    '<title>' + escapeHtml(input.heading) + '</title></head>',
    '<body style="margin:0;padding:0;background:#f3f6fb;color:#071c3b;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">',
    '<div style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;color:transparent;">',
    escapeHtml(input.preheader),
    "</div>",
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:#f3f6fb;"><tr><td align="center" style="padding:36px 16px 44px;">',
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #e3e9f2;border-radius:20px;overflow:hidden;">',
    '<tr><td style="background:#071c3b;padding:26px 32px 24px;border-bottom:4px solid #c6a063;">',
    '<a href="' + site + '" style="text-decoration:none;display:inline-block;">',
    '<span style="display:block;font-size:21px;line-height:27px;letter-spacing:0.02em;font-weight:700;color:#fff;">SAPPHIRE <span style="color:#b7d3ff;">QUEST</span></span>',
    '<span style="display:block;padding-top:4px;font-size:9px;line-height:16px;letter-spacing:2.2px;font-weight:600;color:#b5c9e2;">TRAVEL &bull; TOURS &bull; EXPERIENCES</span>',
    "</a></td></tr>",
    '<tr><td style="padding:37px 32px 30px;">',
    '<p style="margin:0 0 12px;color:#0755db;font-size:10px;line-height:18px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">' +
      escapeHtml(input.eyebrow) + "</p>",
    '<h1 style="margin:0;color:#071c3b;font-size:28px;line-height:36px;font-weight:600;letter-spacing:-0.7px;">' +
      escapeHtml(input.heading) + "</h1>",
    '<p style="margin:18px 0 24px;color:#495a73;font-size:14px;line-height:24px;">' +
      escapeHtml(input.introduction) + "</p>",
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f2f6fc;border:1px solid #e1e9f5;border-radius:12px;">',
    '<tr><td style="padding:17px 20px;">',
    '<span style="display:block;margin-bottom:5px;color:#6a7a92;font-size:10px;line-height:17px;letter-spacing:1.4px;font-weight:700;text-transform:uppercase;">Your reference</span>',
    '<span style="display:block;color:#0755db;font-size:18px;line-height:25px;font-weight:700;letter-spacing:.5px;word-break:break-word;">' +
      escapeHtml(input.reference) + "</span>",
    "</td></tr></table>",
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse;">',
    input.rows,
    "</table>",
    '<h2 style="margin:28px 0 8px;color:#071c3b;font-size:16px;line-height:24px;font-weight:600;">' +
      escapeHtml(input.nextHeading) + "</h2>",
    '<p style="margin:0 0 25px;color:#53657e;font-size:13px;line-height:22px;">' +
      escapeHtml(input.nextText) + "</p>",
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#0755db" style="border-radius:999px;">',
    '<a href="' + escapeHtml(input.buttonHref) +
      '" style="display:inline-block;padding:14px 24px;border-radius:999px;color:#fff;background:#0755db;font-size:13px;line-height:18px;font-weight:600;text-decoration:none;">' +
      escapeHtml(input.buttonText) + "</a>",
    "</td></tr></table>",
    '<p style="margin:25px 0 0;color:#718098;font-size:11px;line-height:19px;">' +
      escapeHtml(input.footnote) + "</p>",
    "</td></tr>",
    '<tr><td style="padding:20px 32px 25px;border-top:1px solid #e9eef5;background:#fbfcfe;">',
    '<p style="margin:0 0 5px;color:#071c3b;font-size:12px;line-height:20px;font-weight:600;">Sapphire Quest</p>',
    '<p style="margin:0;color:#79879c;font-size:11px;line-height:20px;">Thoughtful travel support, from your first enquiry.</p>',
    '<p style="margin:9px 0 0;color:#697b95;font-size:11px;line-height:19px;"><a href="mailto:' +
      contact + '" style="color:#0755db;text-decoration:none;">' + contact +
      '</a> &nbsp;&bull;&nbsp; <a href="' + site +
      '" style="color:#0755db;text-decoration:none;">sapphirequesttravel.com</a></p>',
    "</td></tr></table>",
    '<p style="margin:20px 0 0;color:#98a4b6;font-size:10px;line-height:18px;text-align:center;">&copy; Sapphire Quest. This is a service notification, not a booking confirmation.</p>',
    "</td></tr></table></body></html>",
  ].join("");
}

export function customerAcknowledgement(input: EnquiryMailData): EmailContent {
  const service = serviceLabel(input.service);
  const reference = cleanLine(input.reference, 72);
  const name = cleanLine(input.name, 100);
  const subject = "We've received your enquiry | " + reference;
  const intro = "Hello " + name + ", thank you for contacting Sapphire Quest. We have received your " +
    service.toLowerCase() + " request and saved the details for our travel team to review.";
  return {
    subject,
    html: shell({
      preheader: "We have received your enquiry. Your reference is " + reference + ".",
      eyebrow: "Enquiry received",
      heading: "Your journey begins here.",
      introduction: intro,
      reference,
      rows: detailRow("Service", service) + detailRow("Request status", "Received — awaiting review"),
      nextHeading: "What happens next?",
      nextText: "Our team will review your request and contact you using the details provided if further information or travel options are needed.",
      buttonText: "Explore Sapphire Quest",
      buttonHref: brand.website,
      footnote: "This email confirms receipt of your enquiry only. It is not a reservation, ticket, payment receipt or visa approval. Please do not share sensitive identity documents by reply unless requested through an appropriate secure channel.",
    }),
    text: [
      "SAPPHIRE QUEST",
      "Your journey begins here.",
      "",
      intro,
      "",
      "Reference: " + reference,
      "Service: " + service,
      "Status: Received — awaiting review",
      "",
      "Next: Our team will review your request and contact you if further information or travel options are needed.",
      "Website: " + brand.website,
      "Contact: " + brand.email,
      "",
      "This confirms receipt only; no booking or visa approval has been made.",
    ].join("\n"),
  };
}

export function staffEnquiryAlert(input: EnquiryMailData): EmailContent {
  const service = serviceLabel(input.service);
  const reference = cleanLine(input.reference, 72);
  const name = cleanLine(input.name, 100);
  const path = input.dashboardPath ?? "/admin/enquiries";
  return {
    subject: "New " + service + " | " + reference,
    html: shell({
      preheader: "A new " + service + " request needs review. Reference " + reference + ".",
      eyebrow: "Private team notification",
      heading: "New enquiry received.",
      introduction: "A Sapphire Quest customer has submitted a new travel request. Sign in to the staff workspace to review and manage it securely.",
      reference,
      rows: detailRow("Client", name) + detailRow("Service", service),
      nextHeading: "Ready for review",
      nextText: "Open the staff dashboard to review the request, assign a team member, update the status and follow up with the client.",
      buttonText: "Open staff dashboard",
      buttonHref: brand.website + path,
      footnote: "For authorised Sapphire Quest staff only. Customer contact information and travel requirements remain in the protected dashboard.",
    }),
    text: [
      "SAPPHIRE QUEST — STAFF NOTIFICATION",
      "New " + service + " received.",
      "",
      "Reference: " + reference,
      "Client: " + name,
      "Service: " + service,
      "Review privately: " + brand.website + path,
      "",
      "Sign in to the staff workspace to access customer details.",
    ].join("\n"),
  };
}
