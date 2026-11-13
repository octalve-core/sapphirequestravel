import { NextRequest, NextResponse, after } from "next/server";
import { randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { findPublicPackage } from "@/server/package-catalog";
import { packageEnquirySchema } from "@/server/package-enquiry-schema";
import { consentOrigin, consumeRateLimit, requestIp } from "@/server/security";
import { notifyNewEnquiry } from "@/server/notifications";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!consentOrigin(req)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (Number(req.headers.get("content-length") || 0) > 12000) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,130}$/.test(slug)) return NextResponse.json({ error: "Package not found" }, { status: 404 });
  const item = await findPublicPackage(slug);
  if (!item) return NextResponse.json({ error: "This package is not currently available for enquiries" }, { status: 404 });

  const payload = await req.json().catch(() => null);
  const parsed = packageEnquirySchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({
    error: parsed.error.issues[0]?.message || "Please check your travel details",
  }, { status: 422 });
  const data = parsed.data;
  if (data.website) return NextResponse.json({ reference: "SQ-RECEIVED" }, { status: 202 });

  try {
    const limited = await consumeRateLimit(
      "package:" + requestIp(req) + ":" + data.email, 5, 15,
    );
    if (limited) return NextResponse.json({ error: "Too many requests. Please contact our team directly." }, { status: 429 });
    const price = item.priceAmount == null ? null :
      Math.round(item.priceAmount * (100 - item.discountPercent)) / 100;
    const reference = "SQP-" + new Date().getUTCFullYear() + "-" + randomBytes(5).toString("hex").toUpperCase();
    const sql = db();
    await sql`
      WITH created AS (
        INSERT INTO package_enquiries
          (reference, package_slug, package_title, destination, price_snapshot, currency,
           preferred_date, departure_city, adults, children, infants, name, email, phone, notes)
        VALUES
          (${reference}, ${item.slug}, ${item.title}, ${item.destination}, ${price}, ${item.currency},
           ${data.preferredDate}, ${data.departureCity}, ${data.adults}, ${data.children},
           ${data.infants}, ${data.name}, ${data.email}, ${data.phone}, ${data.notes})
        RETURNING id
      ), entry AS (
        INSERT INTO package_enquiry_events(enquiry_id,event_type,content)
        SELECT id,'created','New package enquiry received' FROM created RETURNING enquiry_id
      )
      INSERT INTO audit_events(actor_staff_id,action,entity_type,entity_id)
      SELECT NULL,'package_enquiry.created','package_enquiry',id::text FROM created
    `;
    after(() => notifyNewEnquiry({
      reference, name: data.name, email: data.email, service: "Package: " + item.title,
      dashboardPath: "/admin/package-enquiries",
    }));
    return NextResponse.json({ reference }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Package enquiry unavailable", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({
      error: "We couldn't complete your request. Please email info@sapphirequesttravel.com.",
    }, { status: 503 });
  }
}
