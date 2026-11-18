import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Hero } from "@/features/home/sections/hero";
import { ServiceOverview } from "@/features/home/sections/service-overview";
import { DestinationShowcase } from "@/features/home/sections/destination-showcase";
import { Experience } from "@/features/home/sections/experience";
import { Trust } from "@/features/home/sections/trust";
import { FinalCTA } from "@/features/home/sections/final-cta";
import { BookingPanel } from "@/features/home/sections/booking-panel";
export const dynamic = "force-dynamic";
export default function Home(){return <MarketingLayout><Hero/><BookingPanel/><ServiceOverview/><DestinationShowcase/><Experience/><Trust/><FinalCTA/></MarketingLayout>}
