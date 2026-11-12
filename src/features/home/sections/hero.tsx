import { ArrowUpRight, Compass, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

/** Homepage-only sapphire veil; internal PageHero overlays stay unchanged. */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      <Image src="/images/hero-runway.webp" fill priority alt="Aircraft aligned with an illuminated runway at night" className="object-cover object-center" sizes="100vw"/>
      <div aria-hidden="true" className="absolute inset-0 bg-[#063779]/80"/>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#04122f]/80 via-[#063b8d]/45 to-[#0755db]/10"/>
      <div className="container-wide relative flex min-h-[540px] items-center py-20 sm:min-h-[590px] lg:min-h-[600px]">
        <div className="max-w-[740px]">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Compass size={15}/> The world is within reach
          </div>
          <h1 className="display-heading text-[clamp(2.3rem,4.3vw,4.15rem)]">
            Beyond the destination.<br/><span className="text-[#f5ce8b]">A better journey.</span>
          </h1>
          <p className="mt-8 max-w-[560px] text-base leading-8 text-white/85 sm:text-lg">
            Beautifully considered travel solutions for wherever life, work and curiosity take you.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/request" variant="light">Plan your journey <ArrowUpRight size={17}/></ButtonLink>
            <ButtonLink href="/services" className="border border-white/35 bg-white/10 text-white hover:bg-white/20">Explore our services</ButtonLink>
          </div>
          <div className="mt-16 flex items-center gap-3 text-xs text-white/75">
            <ShieldCheck size={18} className="text-[#f5ce8b]"/> Personally supported from enquiry to itinerary.
          </div>
        </div>
      </div>
    </section>
  );
}
