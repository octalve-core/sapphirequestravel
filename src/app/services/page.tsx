import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { ServiceCatalog } from "@/features/services/sections/service-catalog";
import { FinalCTA } from "@/features/home/sections/final-cta";
export const metadata:Metadata={title:"Travel services"};
export default function Services(){return <MarketingLayout><PageHero image="/images/hero-services.webp" overlay="deep" eyebrow="Our services" title="Travel solutions that fit your plans." description="From a single ticket to group travel arrangements, we bring practical support and careful attention to every request."/><ServiceCatalog/><FinalCTA/></MarketingLayout>}
