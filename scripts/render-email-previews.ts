/** Preview real transactional templates locally; never contacts Resend or reads API keys. */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { customerAcknowledgement, staffEnquiryAlert } from "../src/server/email-templates";

const example = {
  reference: "SQP-2026-PREVIEW",
  name: "Amina Bello",
  service: "Package: Dubai City Escape",
  dashboardPath: "/admin/package-enquiries" as const,
};
const dir=join(process.cwd(),".email-previews");
mkdirSync(dir,{recursive:true});
const files=[
  ["customer-acknowledgement.html",customerAcknowledgement(example).html],
  ["staff-new-enquiry.html",staffEnquiryAlert(example).html],
] as const;
for(const [file,html] of files){
  writeFileSync(join(dir,file),html,"utf8");
  console.log("Created "+join(".email-previews",file));
}
console.log("These are visual previews only. No emails were sent.");
