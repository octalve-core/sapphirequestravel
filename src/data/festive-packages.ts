import catalog from "@/data/festive-packages.json";
import { packageSchema, type PackageRecord } from "@/server/package-schema";

/** Five customer-facing, enquiry-led festive experiences. DB records override these
 * initial catalogue values once the staff import has been performed. */
export const featuredPackages: PackageRecord[] = catalog.map((raw) => ({
  ...packageSchema.parse(raw),
  id: "curated-" + raw.slug,
}));
export const featuredPackageSlugs = new Set(featuredPackages.map((item) => item.slug));

/** These were technical demonstration records accidentally made public before launch.
 * Hide them by exact slug without modifying any historical database rows. */
export const legacyDemonstrationSlugs = new Set([
  "uk-city-break",
  "singapore-city-discovery",
  "dubai-business-visit",
  "sample-uk-city-break",
  "sample-singapore-city-discovery",
  "sample-dubai-business-visit",
]);
