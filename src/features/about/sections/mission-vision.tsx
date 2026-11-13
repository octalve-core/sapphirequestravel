import Image from "next/image";
import { Eye, Target } from "lucide-react";

/** Company-approved mission and vision, styled as staggered editorial cards.
 * Keep text in HTML; the scenic photograph is purely decorative. */
export function MissionVision() {
  return (
    <section aria-labelledby="mission-vision-heading" className="relative isolate overflow-hidden bg-[#071a35] py-20 text-white sm:py-28">
      <Image
        src="/images/hero-curated-travel.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#06162e]/80" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#0649a1]/35 via-[#061c43]/20 to-[#020a1b]/85" />

      <div className="container-wide relative">
        <div className="max-w-[730px]">
          <p className="text-[11px] font-medium uppercase tracking-[.2em] text-[#d8e8ff]">The direction behind every journey</p>
          <h2 id="mission-vision-heading" className="display-heading mt-5 text-[clamp(2rem,4vw,3.65rem)]">
            A clear purpose. <span className="text-[#f2d39d]">A bigger horizon.</span>
          </h2>
          <p className="mt-5 max-w-[560px] text-sm leading-7 text-white/85 sm:text-base">
            Thoughtful travel begins with knowing what matters — to our clients, our people and every journey we help shape.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12 lg:gap-8">
          <article className="rounded-[24px] border border-white/85 bg-white p-7 text-navy shadow-[0_26px_65px_rgba(1,15,41,.23)] sm:p-10 lg:col-span-6 lg:col-start-7 lg:row-start-1">
            <div className="flex items-start justify-between gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eaf2ff] text-sapphire">
                <Target aria-hidden="true" size={29} strokeWidth={1.55} />
              </span>
              <span className="text-[11px] font-medium tracking-[.2em] text-[#7b89a0]">01 / PURPOSE</span>
            </div>
            <h3 className="mt-8 text-[clamp(1.8rem,3vw,2.65rem)] font-medium tracking-[-.045em] text-[#0755db]">
              Our mission
            </h3>
            <div className="mt-5 h-px bg-[#dbe4f0]" />
            <p className="mt-6 max-w-[470px] text-[15px] leading-8 text-[#354662] sm:text-base">
              To make travel simpler through clear advice, dependable coordination and service centred on each traveller&apos;s purpose.
            </p>
          </article>

          <article className="rounded-[24px] border border-white/85 bg-white p-7 text-navy shadow-[0_26px_65px_rgba(1,15,41,.23)] sm:p-10 lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:mt-28">
            <div className="flex items-start justify-between gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#fcf2df] text-[#a8792d]">
                <Eye aria-hidden="true" size={29} strokeWidth={1.55} />
              </span>
              <span className="text-[11px] font-medium tracking-[.2em] text-[#7b89a0]">02 / AMBITION</span>
            </div>
            <h3 className="mt-8 text-[clamp(1.8rem,3vw,2.65rem)] font-medium tracking-[-.045em] text-navy">
              Our vision
            </h3>
            <div className="mt-5 h-px bg-[#dbe4f0]" />
            <p className="mt-6 max-w-[470px] text-[15px] leading-8 text-[#354662] sm:text-base">
              To be a trusted travel-management partner known for attentive service, professional standards and international outlook.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
