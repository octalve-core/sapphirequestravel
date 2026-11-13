import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { ContactOptions } from "@/features/contact/sections/contact-options";
export const metadata:Metadata={
  title:"Contact Sapphire Quest",
  description:"Contact Sapphire Quest Travel & Tour for flight arrangements, visa assistance, group travel and personal travel planning. Call, email or request a quote.",
  alternates:{canonical:"/contact"},
  openGraph:{title:"Contact Sapphire Quest",description:"Speak with our travel team about your next journey.",url:"/contact"},
};
export default function Contact(){return <MarketingLayout><PageHero image="/images/hero-contact.webp" overlay="deep" eyebrow="Contact" title="Let's talk about your journey." description="Our team is ready to understand what you need and guide you through your next steps."/><ContactOptions/></MarketingLayout>}
