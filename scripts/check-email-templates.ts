import { strict as assert } from "node:assert";
import { customerAcknowledgement, staffEnquiryAlert } from "../src/server/email-templates";

const sample={
  reference:"SQV-2026-ABC123",
  name:"Kareem <script>alert('test')</script>",
  service:"Visa assistance",
  dashboardPath:"/admin/visa-enquiries" as const,
};
const customer=customerAcknowledgement(sample);
const staff=staffEnquiryAlert(sample);
for(const email of [customer,staff]){
  assert.ok(email.html.startsWith("<!doctype html>"),"HTML document required");
  assert.ok(email.html.includes("/branding/sapphire-quest-on-dark.png"),"Official brand image required");
  assert.ok(email.html.includes("sq-content"),"Responsive content padding required");
  assert.ok(email.html.includes("background:#071c3b"),"Brand navy header required");
  assert.ok(email.html.includes("background:#0755db"),"Brand blue call to action required");
  assert.ok(email.html.includes("&lt;script&gt;"),"Input must be escaped");
  assert.equal(email.html.includes("<script>alert"),false,"No raw user HTML");
  assert.ok(email.text.includes(sample.reference),"Text fallback must include reference");
  assert.ok(email.subject.includes(sample.reference),"Subject must include reference");
  assert.ok(!email.subject.includes("\n"),"Subject safety");
}
assert.ok(customer.html.includes("Your journey begins here."),"Customer heading");
assert.ok(customer.html.includes("not a reservation, ticket, payment receipt or visa approval"),"Truthful receipt");
assert.ok(!customer.html.includes("/admin/visa-enquiries"),"Staff link must not reach customer");
assert.ok(staff.html.includes("/admin/visa-enquiries"),"Staff dashboard link required");
assert.ok(staff.html.includes("A new journey enquiry."),"Staff heading");
const malicious=customerAcknowledgement({...sample,name:"A\r\nB",service:"Package: <img src=x>"});
assert.ok(!malicious.subject.includes("\n"),"No newline in subject");
assert.ok(!malicious.html.includes("<img src=x>"),"No injected HTML");
assert.ok(malicious.html.includes("&lt;img src=x&gt;"),"Service must be escaped");
console.log("Transactional email templates pass escaping, recipient separation and receipt-language checks.");
