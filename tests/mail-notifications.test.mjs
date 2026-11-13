import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("transactional templates use an accessible, minimal email-client-safe design", () => {
  const source = read("src/server/email-templates.ts");
  for (const marker of ["Sapphire Quest", "sapphire-quest-on-dark.png", "#071c3b", "#0755db", "#c6a063",
    "<!doctype html>", "viewport", 'role="presentation"', "customerAcknowledgement", "staffEnquiryAlert"]) {
    assert.ok(source.includes(marker), marker);
  }
  assert.match(source, /Your journey begins here/);
  assert.match(source, /A new journey enquiry/);
  assert.match(source, /font-family:Arial,Helvetica,sans-serif/);
  assert.match(source, /display:none!important/);
  assert.match(source, /This email confirms receipt of your enquiry only/);
  assert.match(source, /not a reservation, ticket, payment receipt or visa approval/);
  assert.match(source, /\/branding\/sapphire-quest-on-dark\.png/);
  assert.doesNotMatch(source, /tracking-pixel|googleapis\.com|beacon\.gif/i);
});

test("input data is safely escaped and recipients are separated", () => {
  const src=read("src/server/email-templates.ts");
  assert.match(src,/function escapeHtml/);
  assert.match(src,/\.replaceAll\("&", "&amp;"\)/);
  assert.match(src,/\.replaceAll\("<", "&lt;"\)/);
  assert.match(src,/function cleanLine/);
  assert.match(src,/dashboardPath \?\? "\/admin\/enquiries"/);
  assert.match(src,/Customer contact information and travel requirements remain in the protected dashboard/);
});

test("all three request endpoints trigger only post-persistence notification",()=>{
  for (const [path,address] of [
    ["src/app/api/enquiries/route.ts", "x.email"],
    ["src/app/api/visa-enquiries/route.ts", "x.email"],
    ["src/app/api/packages/[slug]/enquiries/route.ts", "data.email"],
  ]) {
    const source=read(path);
    assert.match(source, /import \{ NextRequest, NextResponse, after \} from "next\/server"/);
    assert.match(source, /after\(\(\) => notifyNewEnquiry\(/);
    assert.ok(source.includes("email:"+address)||source.includes("email: "+address),path);
    assert.match(source, /INSERT INTO (?:enquiries|visa_enquiries|package_enquiries)/);
    assert.doesNotMatch(source, /await notifyNewEnquiry/);
  }
});

test("Resend transports HTML and text safely and keeps customer delivery opt-in",()=>{
  const source=read("src/server/notifications.ts");
  assert.match(source,/process\.env\.RESEND_API_KEY/);
  assert.match(source,/process\.env\.NOTIFY_FROM/);
  assert.match(source,/process\.env\.CUSTOMER_ACKNOWLEDGEMENTS === "true"/);
  assert.match(source,/reply_to: input\.replyTo/);
  assert.match(source,/"Idempotency-Key":/);
  assert.match(source,/Promise\.allSettled\(jobs\)/);
  assert.match(source,/4500/);
  assert.match(source,/text: input\.email\.text/);
  assert.match(source,/html: input\.email\.html/);
  assert.doesNotMatch(source,/throw new Error/);
});

test("documented sender uses dedicated Resend subdomain with Zoho reply-to",()=>{
  const env=read(".env.example");
  assert.match(env,/NOTIFY_FROM="Sapphire Quest <notifications@notify\.sapphirequesttravel\.com>"/);
  assert.match(env,/NOTIFY_TO="info@sapphirequesttravel\.com"/);
  assert.match(env,/NOTIFY_REPLY_TO="info@sapphirequesttravel\.com"/);
  assert.match(env,/CUSTOMER_ACKNOWLEDGEMENTS="false"/);
});
