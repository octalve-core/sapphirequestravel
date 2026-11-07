import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** Compact editorial CTA: one full-bleed photo, a single blue veil and one action. */
export function FinalCTA() {
  return (
    <section aria-labelledby="journey-next-chapter" className="bg-cloud py-14 sm:py-20">
      <div className="container-wide">
        <div className="relative isolate flex min-h-[330px] items-center overflow-hidden rounded-[22px] bg-[#061a38] sm:min-h-[350px] sm:rounded-[26px]">
          <Image
            src="/images/cta-airport-lounge.webp"
            alt="Travellers relaxing together before their journey"
            fill
            sizes="(max-width: 768px) 100vw, 1320px"
            className="object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[#032867]/65"/>
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#030e28]/85 via-[#06285a]/45 to-[#06285a]/10"/>
          <div className="relative z-10 w-full px-6 py-11 text-white sm:px-12 lg:px-14">
            <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#ebd094]">Your next chapter</p>
            <h2 id="journey-next-chapter" className="mt-4 max-w-[600px] text-[clamp(1.7rem,2.8vw,2.5rem)] font-medium leading-[1.2] tracking-[-.045em]">
              A journey worth looking forward to.
            </h2>
            <p className="mt-4 max-w-[490px] text-[13px] leading-6 text-white/85 sm:text-sm">
              Share your plans with us. We&apos;ll help you take the next step.
            </p>
            <ButtonLink href="/request" variant="light" className="mt-7 min-h-11 px-6 text-[13px]">
              Start planning <ArrowUpRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
