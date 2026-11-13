import "server-only";
import { publicPackageCatalog } from "@/server/package-catalog";
import type { PackageRecord } from "@/server/package-schema";

/** Only published, image-backed packages appear in the four original home tiles.
 * The package record is the one source of truth for routes, imagery and edits. */
export async function homeFeaturedPackages(): Promise<PackageRecord[]> {
  const offers = await publicPackageCatalog();
  return offers
    .filter((item) => item.status === "published" && item.details.home?.enabled &&
      Boolean(item.images[0] || item.details.home.image))
    .sort((a, b) => {
      const order = (a.details.home?.position ?? 100) - (b.details.home?.position ?? 100);
      return order || a.slug.localeCompare(b.slug);
    })
    .slice(0, 4);
}
