import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { DestinationShowcase } from "@/features/home/sections/destination-showcase";
import { FinalCTA } from "@/features/home/sections/final-cta";
export const metadata:Metadata={title:"Destinations"};
export default function Destinations(){return <MarketingLayout><PageHero image="/images/coastal.webp" eyebrow="Discover" title="There's more out there." description="Explore destinations and connect with our team to plan travel around your timing, interests and priorities."/><DestinationShowcase/><FinalCTA/></MarketingLayout>}
