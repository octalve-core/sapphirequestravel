import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { PrivacyDetails } from "@/features/legal/sections/privacy-details";
export const metadata:Metadata={title:"Privacy"};
export default function Privacy(){return <MarketingLayout><PageHero image="/images/global-routes.webp" overlay="deep" eyebrow="Privacy" title="Your information matters." description="How we use information you submit when requesting travel services."/><PrivacyDetails/></MarketingLayout>}
