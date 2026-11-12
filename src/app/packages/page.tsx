import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { PackageCards } from "@/features/packages/sections/package-cards";
export const metadata:Metadata={title:"Travel packages"};export const dynamic="force-dynamic";
export default function Packages(){return <MarketingLayout><PageHero image="/images/hero-packages.webp" overlay="deep" eyebrow="Curated travel" title="More reasons to go." description="Discover thoughtfully selected travel ideas and discuss your plans with our team. Package prices and availability are confirmed individually."/><PackageCards/></MarketingLayout>}
