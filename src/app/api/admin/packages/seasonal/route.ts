import { NextRequest, NextResponse } from "next/server";
import { currentStaff, canManage } from "@/server/auth";
import { consentOrigin } from "@/server/security";
import { db } from "@/server/db";
import { featuredPackages } from "@/data/festive-packages";

export const runtime = "nodejs";

/** One-time, owner/manager-approved import into the existing package CMS.
 * Repeated calls never overwrite a staff-edited price, gallery or itinerary. */
export async function POST(req: NextRequest) {
  if (!consentOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const staff = await currentStaff();
  if (!staff || !canManage(staff)) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Package management is currently unavailable" }, { status: 503 });
  }

  let created = 0;
  try {
    const sql = db();
    for (const offer of featuredPackages) {
      const rows = await sql`
        WITH inserted AS (
          INSERT INTO travel_packages
            (title,slug,summary,destination,status,highlights,price_amount,currency,
             discount_percent,features,images,details,hero_image)
          VALUES
            (${offer.title},${offer.slug},${offer.summary},${offer.destination},'published',
             ${offer.highlights},${offer.priceAmount},${offer.currency},0,
             ${JSON.stringify(offer.features)}::jsonb,
             ${JSON.stringify(offer.images)}::jsonb,
             ${JSON.stringify(offer.details)}::jsonb,'')
          ON CONFLICT (slug) DO NOTHING
          RETURNING id
        ),
        logged AS (
          INSERT INTO audit_events (actor_staff_id,action,entity_type,entity_id)
          SELECT ${staff.id},'package.import_festive','package',id::text FROM inserted
          RETURNING entity_id
        )
        SELECT id FROM inserted
      `;
      created += rows.length;
    }

    return NextResponse.json({
      ok: true,
      created,
      unchanged: featuredPackages.length - created,
      message: created > 0 ? "The festive collection has been added to your package editor." : "The collection is already in your package editor.",
    });
  } catch (error) {
    console.error("Festive package import failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({
      error: "Unable to import the collection. Verify the package database setup and try again.",
    }, { status: 503 });
  }
}
