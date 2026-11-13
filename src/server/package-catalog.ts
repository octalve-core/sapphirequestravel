import "server-only";
import { db } from "@/server/db";
import { featuredPackages, featuredPackageSlugs, legacyDemonstrationSlugs } from "@/data/festive-packages";
import { packageSchema, type PackageRecord } from "@/server/package-schema";

/** Staff-edited Neon packages take precedence over the initial featured catalogue.
 * A staff-unpublished featured package must remain unpublished. */
export async function publicPackageCatalog(): Promise<PackageRecord[]> {
  const bySlug = new Map<string, PackageRecord>(featuredPackages.map((item) => [item.slug, item]));
  const others: PackageRecord[] = [];
  if (!process.env.DATABASE_URL) return [...bySlug.values()];

  let rows: Record<string, unknown>[] = [];
  try {
    const sql = db();
    rows = (await sql`
      SELECT id, title, slug, summary, destination, status, highlights,
        price_amount::float AS "priceAmount", currency,
        discount_percent AS "discountPercent", features, images, details,
        rating_score::float AS "ratingScore", rating_count AS "ratingCount", rating_source AS "ratingSource"
      FROM travel_packages ORDER BY updated_at DESC LIMIT 200
    `) as Record<string, unknown>[];
  } catch {
    try {
      // Support an older schema without altering customer or staff data.
      const sql = db();
      const oldRows = await sql`
        SELECT id, title, slug, summary, destination, status, highlights,
          price_amount::float AS "priceAmount", currency,
          discount_percent AS "discountPercent", features, images, details
        FROM travel_packages ORDER BY updated_at DESC LIMIT 200
      `;
      rows = oldRows as Record<string, unknown>[];
    } catch {
      return [...bySlug.values()];
    }
  }

  for (const row of rows) {
    const slug = typeof row.slug === "string" ? row.slug : "";
    if (legacyDemonstrationSlugs.has(slug)) continue;
    if (typeof row.title === "string" && row.title.startsWith("SAMPLE")) continue;
    const seedHome = bySlug.get(slug)?.details.home;
    const rawDetails = row.details;
    const objectDetails = rawDetails && typeof rawDetails === "object" && !Array.isArray(rawDetails)
      ? rawDetails as Record<string, unknown> : null;
    // A previously imported package may not yet have homepage settings. Reuse
    // the original editorial defaults until an admin explicitly saves settings.
    // Explicit enabled:false must NOT be overridden by seeded defaults.
    const candidate = seedHome && objectDetails && !Object.prototype.hasOwnProperty.call(objectDetails, "home")
      ? { ...row, details: { ...objectDetails, home: seedHome } }
      : row;
    const parsed = packageSchema.safeParse(candidate);
    if (!parsed.success) continue;
    const record: PackageRecord = { ...parsed.data, id: String(row.id) };
    if (featuredPackageSlugs.has(record.slug)) {
      if (record.status === "draft") bySlug.delete(record.slug);
      else bySlug.set(record.slug, record);
    } else if (record.status === "published") {
      others.push(record);
    }
  }

  const curated = featuredPackages
    .map((item) => bySlug.get(item.slug))
    .filter((item): item is PackageRecord => Boolean(item));
  return [...curated, ...others];
}

export async function findPublicPackage(slug: string): Promise<PackageRecord | undefined> {
  return (await publicPackageCatalog()).find((item) => item.slug === slug);
}
