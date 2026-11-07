import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PackagePublicPage } from "@/features/packages/sections/package-public-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Travel package" };
export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MarketingLayout><PackagePublicPage slug={slug}/></MarketingLayout>;
}
