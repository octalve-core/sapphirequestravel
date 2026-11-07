import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** Editorial, image-backed CTA; all copy and actions remain accessible React content. */
export function FinalCTA() {
  return (
    <section aria-labelledby="journey-next-chapter" className="bg-cloud py-14 sm:py-20 lg:py-28">
      <div className="container-wide">
        <div className="relative isolate min-h-[510px] overflow-hidden rounded-[24px] bg-[#071b35] shadow-[0_32px_75px_-42px_rgba(7,28,59,.48)] sm:min-h-[540px] sm:rounded-[30px] lg:min-h-[565px]">
          {/* Clean editorial photography: no embedded headlines, buttons, or UI. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[78%] lg:w-[65%]">
            <Image
              src="/images/cta-airport-lounge.webp"
              alt="Travellers enjoying a relaxed moment together in an airport lounge"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 78vw, 65vw"
              className="object-cover object-[55%_center] sm:object-[65%_center] lg:object-center"
            />
          </div>

          {/* Background gradients support contrast on small screens and wide displays. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06182e]/95 via-[#06182e]/72 to-[#06182e]/10" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06182e]/55 via-transparent to-transparent sm:bg-none" />

          <div className="relative z-10 flex min-h-[510px] items-center px-5 py-8 sm:min-h-[540px] sm:px-8 sm:py-10 lg:min-h-[565px] lg:px-14">
            <div className="w-full max-w-[650px] rounded-[20px] border border-white/15 bg-[#071a32]/75 p-6 text-white shadow-[0_14px_70px_rgba(0,0,0,.15)] backdrop-blur-xl sm:rounded-[24px] sm:p-10 lg:px-12 lg:py-12">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.2em] text-[#e6c584]">
                Your next chapter <span aria-hidden="true" className="h-px w-11 bg-[#e6c584]/85" />
              </p>
              <h2
                id="journey-next-chapter"
                className="mt-6 max-w-[550px] text-[clamp(2.25rem,4.2vw,3.85rem)] font-medium leading-[1.08] tracking-[-.052em] text-white"
              >
                A journey worth looking forward to.
              </h2>
              <p className="mt-6 max-w-[445px] text-[14px] leading-[1.9] text-white/85 sm:text-[15px]">
                Share your plans with us. We&apos;ll help you turn them into a practical next step.
              </p>
              <div className="mt-9">
                <ButtonLink href="/request" className="min-h-[52px] px-7 shadow-[0_9px_30px_rgba(4,71,170,.22)]">
                  Start planning <ArrowUpRight size={17} aria-hidden="true" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
