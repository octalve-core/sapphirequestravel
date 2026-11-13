import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { TrackRecord } from "@/features/corporate-travel/sections/track-record";
export const metadata:Metadata={
  title:"Corporate & Conference Travel",
  description:"Coordinate business travel, conferences and group journeys with Sapphire Quest. Specify your destination country and city, preferred dates and nearby airport.",
  alternates:{canonical:"/corporate-travel"},
};
export default function Corporate(){return <MarketingLayout><PageHero image="/images/global-routes.webp" overlay="deep" eyebrow="Corporate travel" title="Professional travel, carefully coordinated." description="When a meeting, scientific conference or organisational programme matters, its travel arrangements do too."/><TrackRecord/></MarketingLayout>}
