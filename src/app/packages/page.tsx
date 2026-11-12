import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { PackageCards } from "@/features/packages/sections/package-cards";

export const metadata: Metadata = {
  title: "Curated Travel & Festive Packages",
  description:
    "Discover Sapphire Quest festive 2026/27 travel packages from Lagos to Accra, Nairobi, Zanzibar, Dubai and Cape Town. Beautiful journeys, thoughtfully arranged.",
};
export const dynamic = "force-dynamic";

export default function Packages() {
  return (
    <MarketingLayout>
      <PageHero
        image="/images/hero-packages.webp"
        overlay="deep"
        eyebrow="The festive collection"
        title="More reasons to go."
        description="A season of unforgettable places, meaningful experiences and memories made together. Discover the escape that feels like yours."
      />
      <PackageCards />
    </MarketingLayout>
  );
}
