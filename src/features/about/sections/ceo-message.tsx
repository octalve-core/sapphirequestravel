import Image from "next/image";
import { Quote } from "lucide-react";

/** Editorial CEO feature; uses the approved supplied portrait without altering the person. */
export function CeoMessage() {
  return (
    <section aria-labelledby="ceo-message-title" className="overflow-hidden bg-[#f4f7fc] py-16 sm:py-24">
      <div className="container-wide grid items-center gap-10 md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] md:gap-14 lg:gap-20">
        <div className="relative mx-auto w-full max-w-[410px] md:mx-0">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-[#dbe5f3] shadow-[0_25px_60px_rgba(7,28,59,.12)] sm:rounded-[28px]">
            <Image
              src="/images/ceo-portrait.webp"
              fill
              alt="Professional portrait of Dr. Aderonke A. Akerele"
              sizes="(max-width: 767px) 90vw, 410px"
              className="object-cover object-center"
            />
          </div>
          <div className="absolute -bottom-4 -right-2 hidden rounded-2xl bg-white px-6 py-4 shadow-[0_12px_40px_rgba(7,28,59,.10)] sm:block md:-right-6">
            <p className="text-[13px] font-medium text-navy">Dr. Aderonke A. Akerele</p>
            <p className="mt-1 text-[11px] text-muted">Chief Executive Officer</p>
          </div>
        </div>
        <div className="max-w-[730px]">
          <p className="eyebrow">Leadership & purpose</p>
          <h2 id="ceo-message-title" className="display-heading mt-4 text-[clamp(1.8rem,3.3vw,3rem)] text-navy">
            A message from our CEO
          </h2>
          <Quote aria-hidden="true" size={34} strokeWidth={1.3} className="mt-9 text-[#b99254]" />
          <blockquote className="mt-4 border-l-[3px] border-[#c6a063] pl-6 sm:pl-8">
            <p className="text-[clamp(1.15rem,2.05vw,1.65rem)] font-medium leading-[1.65] tracking-[-.028em] text-[#1d3658]">
              “Every journey begins with a purpose. Our responsibility is to make the experience seamless, dependable, and truly worthwhile.”
            </p>
          </blockquote>
          <div className="mt-9 border-t border-[#dbe3ee] pt-6 sm:mt-11">
            <p className="text-[15px] font-medium text-navy">Dr. Aderonke A. Akerele</p>
            <p className="mt-1 text-[12px] text-muted">Chief Executive Officer, Sapphire Quest Travels & Tours Ltd</p>
          </div>
        </div>
      </div>
    </section>
  );
}
