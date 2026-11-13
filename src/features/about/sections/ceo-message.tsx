import Image from "next/image";
import { Quote } from "lucide-react";

/** Editorial CEO feature; retains the original supplied portrait and identity. */
export function CeoMessage() {
  return (
    <section aria-labelledby="ceo-message-title" className="relative isolate overflow-hidden bg-[#020b19] py-20 text-white sm:py-28">
      <Image
        src="/images/hero-runway.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-[#020914]/88" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#07172f]/45 via-[#031026]/75 to-[#020712]/90" />

      <div className="container-wide relative grid items-center gap-11 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-20">
        <div className="relative mx-auto w-full max-w-[475px] lg:mx-0">
          <div className="relative overflow-hidden rounded-[24px] border border-[#d9b574]/75 p-[11px] shadow-[0_32px_75px_rgba(0,0,0,.3)] sm:rounded-[28px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-[#d7deea] sm:rounded-[19px]">
              <Image
                src="/images/ceo-portrait.webp"
                alt="Portrait of Dr. Aderonke A. Akerele, Chief Executive Officer"
                fill
                sizes="(max-width: 1023px) 90vw, 475px"
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="absolute -bottom-4 right-5 h-1 w-20 rounded-full bg-[#d7b373] sm:right-8" aria-hidden="true" />
        </div>

        <div className="max-w-[720px]">
          <p className="text-[11px] font-medium uppercase tracking-[.2em] text-[#e9c991]">A note from our CEO</p>
          <h2 id="ceo-message-title" className="display-heading mt-5 text-[clamp(2.1rem,3.8vw,3.9rem)]">
            Great journeys <span className="text-[#f0d198]">begin with purpose.</span>
          </h2>
          <div aria-hidden="true" className="mt-7 h-px w-20 bg-[#d7b373]" />

          <blockquote className="mt-7">
            <Quote aria-hidden="true" size={26} strokeWidth={1.4} className="text-[#e2c18a]" />
            <p className="mt-3 text-[clamp(1.05rem,1.65vw,1.3rem)] font-medium leading-[1.65] tracking-[-.025em] text-white">
              “Every journey begins with a purpose. Our responsibility is to make the experience seamless, dependable, and truly worthwhile.”
            </p>
          </blockquote>

          <div className="mt-7 space-y-4 text-[13px] leading-[1.85] text-white/80 sm:text-[14px]">
            <p>
              At Sapphire Quest Travels &amp; Tours Ltd, we believe travel is more than reaching a destination.
              It is about connecting people to opportunities, experiences, and possibilities beyond borders.
            </p>
            <p>
              Our commitment is to deliver thoughtful, reliable, and personalised travel solutions that meet
              the evolving needs of individuals, professionals, and organisations.
            </p>
            <p>
              From personal journeys to international conferences and institutional engagements, we approach
              every assignment with professionalism, attention to detail, and a genuine commitment to client satisfaction.
            </p>
            <p>
              As we continue to grow, our vision remains clear: to build a trusted travel brand recognised for
              service excellence, integrity, and meaningful client relationships.
            </p>
          </div>

          <div className="mt-8 border-t border-white/20 pt-6">
            <p className="text-[16px] font-medium text-[#eac98e]">Dr. Aderonke A. Akerele</p>
            <p className="mt-1 text-[12px] leading-6 text-white/75">
              Chief Executive Officer
            </p>
            <p className="text-[12px] leading-6 text-white/75">Sapphire Quest Travel &amp; Tour Ltd</p>
          </div>
        </div>
      </div>
    </section>
  );
}
