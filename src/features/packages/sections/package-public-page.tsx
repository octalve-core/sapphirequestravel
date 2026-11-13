import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/page-hero";
import { PackageDetails } from "@/features/packages/sections/package-details";
import { findPublicPackage } from "@/server/package-catalog";

/** Only public offers reach this page; staff-edited entries take precedence. */
export async function PackagePublicPage({ slug }: { slug: string }) {
  if (!/^[a-z0-9-]{1,130}$/.test(slug)) notFound();
  const record = await findPublicPackage(slug);
  if (!record) notFound();
  return (
    <>
      <PageHero
        image={record.images?.[0] || record.details.home?.image || "/images/hero-packages.webp"}
        overlay="deep"
        eyebrow={record.destination}
        title={record.title}
        description={record.summary}
      />
      <PackageDetails item={record} />
    </>
  );
}
