import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { ServiceOverview } from "@/features/home/sections/service-overview";
import { FinalCTA } from "@/features/home/sections/final-cta";
export const metadata:Metadata={title:"Travel services"};
export default function Services(){return <MarketingLayout><PageHero image="/images/hero-runway.webp" eyebrow="Our services" title="Travel solutions that fit your plans." description="From a single ticket to group travel arrangements, we bring practical support and careful attention to every request."/><ServiceOverview/><FinalCTA/></MarketingLayout>}
