import "server-only";
import { brand } from "@/config/brand";
/** Best-effort internal notification. Enquiry persistence must not depend on mail delivery. */
export async function notifyNewEnquiry(input:{reference:string,name:string,service:string}){
 const apiKey=process.env.RESEND_API_KEY;
 if(!apiKey)return;
 const to=process.env.NOTIFY_TO??brand.email;
 const from=process.env.NOTIFY_FROM??`Sapphire Quest <info@sapphirequesttravel.com>`;
 try{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),4500);
  try {const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject:`New Sapphire Quest enquiry: ${input.reference}`,text:`A new ${input.service} enquiry has arrived.\nReference: ${input.reference}\nCustomer: ${input.name}\nSign in to the Sapphire Quest staff dashboard to review securely.\n${brand.website}/admin/enquiries`}),signal:controller.signal,cache:"no-store"});if(!response.ok)console.error("Email notification rejected",response.status)}finally{clearTimeout(timer)}
 }catch{console.error("Email notification unavailable")}
}
