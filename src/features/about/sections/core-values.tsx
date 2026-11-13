import { Crosshair, Handshake, ShieldCheck } from "lucide-react";

const values = [
  {
    number: "01",
    name: "Integrity",
    icon: ShieldCheck,
    summary: "Clear information and responsible advice.",
    detail: "We communicate openly and approach every travel decision with honesty.",
  },
  {
    number: "02",
    name: "Precision",
    icon: Crosshair,
    summary: "Attention to travel requirements and documentation.",
    detail: "We care about the details that make an itinerary run more smoothly.",
  },
  {
    number: "03",
    name: "Service",
    icon: Handshake,
    summary: "Respectful communication and client-focused support.",
    detail: "We listen carefully and shape our assistance around each traveller.",
  },
] as const;

/** Exactly the three existing Sapphire Quest values, in a lightweight icon-card grid. */
export function CoreValues() {
  return (
    <section aria-labelledby="core-values-heading" className="bg-[#f5f7fb] py-20 sm:py-28">
      <div className="container-wide">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="eyebrow">What guides us</p>
          <h2 id="core-values-heading" className="display-heading mt-4 text-[clamp(2rem,3.6vw,3.3rem)] text-navy">
            Our values, in every detail.
          </h2>
          <p className="mx-auto mt-5 max-w-[570px] text-sm leading-7 text-muted sm:text-base">
            More than principles on a page, these are the standards we bring to every client relationship.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {values.map((value) => (
            <article key={value.name} className="group rounded-[22px] border border-[#e3eaf3] bg-white px-7 py-9 shadow-[0_14px_45px_-32px_rgba(7,28,59,.25)] sm:px-8 sm:py-10">
              <div className="flex items-start justify-between">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#ecf3ff] text-sapphire">
                  <value.icon aria-hidden="true" size={30} strokeWidth={1.45} />
                </span>
                <span className="text-[11px] font-medium tracking-[.15em] text-[#9ca9bc]">{value.number}</span>
              </div>
              <h3 className="mt-8 text-[24px] font-medium tracking-[-.045em] text-navy">{value.name}</h3>
              <p className="mt-4 text-[14px] font-medium leading-7 text-[#344964]">{value.summary}</p>
              <div aria-hidden="true" className="mt-6 h-px w-full bg-[#e6ebf3]" />
              <p className="mt-5 text-[13px] leading-7 text-muted">{value.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
