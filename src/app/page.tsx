import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Hero } from "@/features/home/sections/hero";
import { ServiceOverview } from "@/features/home/sections/service-overview";
import { DestinationShowcase } from "@/features/home/sections/destination-showcase";
import { Experience } from "@/features/home/sections/experience";
import { Trust } from "@/features/home/sections/trust";
import { FinalCTA } from "@/features/home/sections/final-cta";
import { QuickSearch } from "@/features/booking/components/quick-search";
export default function Home(){return <MarketingLayout><Hero/><div className="relative z-10 -mt-9 sm:-mt-16"><QuickSearch/></div><ServiceOverview/><DestinationShowcase/><Experience/><Trust/><FinalCTA/></MarketingLayout>}
