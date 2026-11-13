import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { PackageCards } from "@/features/packages/sections/package-cards";

export const metadata: Metadata = {
  title: "Curated Travel Packages",
  description:
    "Discover Sapphire Quest curated journeys to Singapore, Dubai, Zanzibar, Cape Town, Accra and Nairobi. Thoughtful travel experiences arranged around you.",
};
export const dynamic = "force-dynamic";

export default function Packages() {
  return (
    <MarketingLayout>
      <PageHero
        image="/images/hero-packages.webp"
        overlay="deep"
        eyebrow="The Sapphire Quest collection"
        title="More reasons to go."
        description="Unforgettable places, thoughtful details and meaningful experiences. Discover your next journey with Sapphire Quest."
      />
      <PackageCards />
    </MarketingLayout>
  );
}
