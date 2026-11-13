import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { customerAcknowledgement, staffEnquiryAlert } from "../src/server/email-templates";

const sample = {
  reference: "SQV-2026-DEMO001",
  name: "Amina Bello",
  service: "Visa assistance",
  dashboardPath: "/admin/visa-enquiries" as const,
};
const dir = join(process.cwd(), ".email-previews");
mkdirSync(dir, { recursive: true });
for (const [filename, mail] of [
  ["customer-confirmation.html", customerAcknowledgement(sample)],
  ["staff-notification.html", staffEnquiryAlert(sample)],
] as const) {
  writeFileSync(join(dir, filename), mail.html, "utf8");
  console.log("Email preview ready:", join(".email-previews", filename));
}
console.log("Sample designs only. No emails have been sent.");
