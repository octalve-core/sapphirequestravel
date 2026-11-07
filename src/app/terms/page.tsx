import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { TermsDetails } from "@/features/legal/sections/terms-details";
export const metadata:Metadata={title:"Terms"};
export default function Terms(){return <MarketingLayout><PageHero image="/images/hero-runway.webp" eyebrow="Terms" title="Travel, clearly understood." description="Important information about using our enquiry website."/><TermsDetails/></MarketingLayout>}
