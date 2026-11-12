import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { VisaProcess } from "@/features/visa-assistance/sections/visa-process";
export const metadata:Metadata={title:"Visa assistance"};
export default function Visa(){return <MarketingLayout><PageHero image="/images/hero-visa.webp" overlay="deep" eyebrow="Visa support" title="Clear guidance, one step at a time." description="Practical assistance with visa-document preparation and application processes, including experience supporting UK visa applicants."/><VisaProcess/></MarketingLayout>}
