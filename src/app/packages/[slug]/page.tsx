import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PackagePublicPage } from "@/features/packages/sections/package-public-page";
import { findPublicPackage } from "@/server/package-catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,130}$/.test(slug)) return { title: "Travel packages" };
  const item = await findPublicPackage(slug);
  if (!item) return { title: "Travel packages", robots: { index: false, follow: false } };
  return {
    title: item.title,
    description: item.summary,
    openGraph: {
      title: item.title + " | Sapphire Quest",
      description: item.summary,
      images: [item.images[0] || item.details.home?.image || "/images/hero-packages.webp"],
      type: "website",
    },
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <MarketingLayout>
      <PackagePublicPage slug={slug} />
    </MarketingLayout>
  );
}
