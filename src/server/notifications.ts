import "server-only";
import { brand } from "@/config/brand";
import {
  customerAcknowledgement, staffEnquiryAlert, type EnquiryMailData, type EmailContent,
} from "@/server/email-templates";

export type NewEnquiryNotification = EnquiryMailData & { email: string };

/**
 * Best-effort transactional mail, invoked only AFTER successful database persistence.
 * Sending is scheduled via Next.js after() in each route; API success is never tied to mail.
 * Customer acknowledgements require an explicit opt-in environment switch.
 */
export async function notifyNewEnquiry(input: NewEnquiryNotification): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM || "Sapphire Quest <info@sapphirequesttravel.com>";
  if (!apiKey || !from) return;

  const to = (process.env.NOTIFY_TO || brand.email).split(",")
    .map(item => item.trim()).filter(item => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)).slice(0, 5);
  const confirmationEnabled = process.env.CUSTOMER_ACKNOWLEDGEMENTS === "true";
  const jobs: Promise<void>[] = [];

  if (to.length > 0) jobs.push(send({
    apiKey, from, to, kind: "staff", reference: input.reference,
    email: staffEnquiryAlert(input), replyTo: brand.email,
  }));

  if (confirmationEnabled && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    jobs.push(send({
      apiKey, from, to: [input.email.trim()], kind: "customer",
      reference: input.reference, email: customerAcknowledgement(input),
      replyTo: process.env.NOTIFY_REPLY_TO || brand.email,
    }));
  }
  // Handle each recipient independently: no single delivery failure prevents the other.
  await Promise.allSettled(jobs);
}

async function send(input: {
  apiKey: string;
  from: string;
  to: string[];
  kind: "staff" | "customer";
  reference: string;
  email: EmailContent;
  replyTo: string;
}): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: "Bearer " + input.apiKey,
        "Content-Type": "application/json",
        "Idempotency-Key": "sapphirequest/" + input.reference + "/" + input.kind,
      },
      body: JSON.stringify({
        from: input.from,
        to: input.to,
        reply_to: input.replyTo,
        subject: input.email.subject,
        html: input.email.html,
        text: input.email.text,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      // Never log access tokens, recipients, customer messages or provider response bodies.
      console.error("Sapphire Quest email rejected:", input.kind, response.status);
    }
  } catch {
    console.error("Sapphire Quest email unavailable:", input.kind);
  } finally {
    clearTimeout(timer);
  }
}
