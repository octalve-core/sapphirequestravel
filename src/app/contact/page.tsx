import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { ContactOptions } from "@/features/contact/sections/contact-options";
export const metadata:Metadata={title:"Contact"};
export default function Contact(){return <MarketingLayout><PageHero image="/images/coastal.webp" eyebrow="Contact" title="Let's talk about your journey." description="Our team is ready to understand what you need and guide you through your next steps."/><ContactOptions/></MarketingLayout>}
