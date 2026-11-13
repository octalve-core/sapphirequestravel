import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { AboutStory } from "@/features/about/sections/about-story";
import { MissionVision } from "@/features/about/sections/mission-vision";
import { CoreValues } from "@/features/about/sections/core-values";
import { CeoMessage } from "@/features/about/sections/ceo-message";
import { FinalCTA } from "@/features/home/sections/final-cta";

export const metadata: Metadata = {
  title: "About us",
  alternates: { canonical: "/about" },
  description:
    "Get to know Sapphire Quest Travels & Tours Ltd — our mission, vision, values and a message from our Chief Executive Officer.",
};

export default function About() {
  return (
    <MarketingLayout>
      <PageHero
        image="/images/hero-about.webp"
        overlay="deep"
        eyebrow="About Sapphire Quest"
        title="We believe in better journeys."
        description="A travel-management company focused on thoughtful service, clear communication and journeys shaped around our clients' needs."
      />
      <AboutStory />
      <MissionVision />
      <CoreValues />
      <CeoMessage />
      <FinalCTA />
    </MarketingLayout>
  );
}
