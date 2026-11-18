import Link from "next/link";
import { ArrowUpRight, FileCheck2, Info, ShieldCheck } from "lucide-react";

/** Editorial summaries only: these official authorities determine actual visa requirements. */
const destinations = [
  {
    name: "United Kingdom",
    type: "Standard Visitor visa",
    summary: "A valid travel document and supporting evidence about your visit, circumstances and financial arrangements may be required. Follow the official checklist for your application.",
    authority: "GOV.UK",
    url: "https://www.gov.uk/standard-visitor",
  },
  {
    name: "Canada",
    type: "Visitor visa",
    summary: "IRCC assesses identity, purpose of travel, circumstances and eligibility. The required supporting documents depend on the applicant and the official application process.",
    authority: "Canada.ca / IRCC",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/visitor-visa.html",
  },
  {
    name: "Schengen Area",
    type: "Short-stay visa",
    summary: "Your main destination and travel purpose determine where to apply. Financial evidence, travel plans and compliant travel medical insurance may be required.",
    authority: "European Commission",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy/applying-schengen-visa_en",
  },
  {
    name: "United Arab Emirates",
    type: "Tourist / visit visa",
    summary: "Entry routes and supporting documents depend on nationality, trip purpose and the responsible UAE authority or eligible sponsor. Check the official route before arranging your trip.",
    authority: "UAE Government",
    url: "https://u.ae/en/information-and-services/visa-and-emirates-id/Apply-and-track-visa/where-to-apply-for-entry-permits-or-visas",
  },
] as const;

const questions = [
  {
    q: "Does Sapphire Quest guarantee visa approval?",
    a: "No. Only the relevant immigration authority can approve or refuse an application. Visa assistance does not guarantee approval or shorten official processing times.",
  },
  {
    q: "Which documents will I need?",
    a: "Requirements depend on your nationality, destination, visa category and circumstances. Authorities may request a passport, application form, evidence of travel purpose, financial documents and other supporting material. Follow your official, case-specific checklist.",
  },
  {
    q: "Can I apply while living in Abuja?",
    a: "Many applications can be started online, but biometrics, interviews and document submissions may require an appointment at an approved location. Check the destination authority's instructions before travelling to a centre.",
  },
  {
    q: "How far in advance should I apply?",
    a: "Begin as early as the official application rules allow. Processing periods and appointment availability vary, and no agency can guarantee a processing date.",
  },
  {
    q: "Must I purchase a flight ticket before receiving a visa?",
    a: "Requirements vary by destination. Check the official guidance before paying for non-refundable flights or hotels; a reservation or proposed itinerary may be sufficient in some cases.",
  },
  {
    q: "How can Sapphire Quest assist?",
    a: "Tell us your destination, reason for travel and intended date. We can help you understand the steps and discuss document preparation, without representing an enquiry as a confirmed visa appointment or approval.",
  },
] as const;

export function VisaRequirements() {
  return (
    <>
      <section aria-labelledby="visa-country-guides" className="bg-[#f5f8fc] py-16 sm:py-20">
        <div className="container-wide">
          <p className="eyebrow">Before you apply</p>
          <h2 id="visa-country-guides" className="mt-4 max-w-[780px] text-[clamp(1.8rem,3vw,2.7rem)] font-medium tracking-[-.04em] text-navy">Visa requirements and official guidance</h2>
          <p className="mt-4 max-w-[850px] text-sm leading-7 text-muted">Explore popular destinations, then confirm the requirements for your circumstances with the official immigration authority. These are introductory summaries, not complete document checklists.</p>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {destinations.map((destination) => (
              <article key={destination.name} className="rounded-2xl border border-[#e1e8f1] bg-white p-6 shadow-[0_10px_24px_rgba(7,28,59,.035)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[19px] font-medium text-navy">{destination.name}</h3>
                    <p className="mt-1 text-[12px] font-medium text-sapphire">{destination.type}</p>
                  </div>
                  <FileCheck2 size={22} className="shrink-0 text-sapphire" aria-hidden="true"/>
                </div>
                <p className="mt-5 text-[13px] leading-7 text-[#4e5e75]">{destination.summary}</p>
                <a href={destination.url} target="_blank" rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 text-[12px] font-medium text-sapphire underline-offset-4 hover:underline">
                  Check {destination.authority} <ArrowUpRight size={15} aria-hidden="true"/>
                </a>
              </article>
            ))}
          </div>
          <p className="mt-6 flex max-w-[920px] items-start gap-2 text-[12px] leading-6 text-[#64728a]">
            <Info size={16} className="mt-1 shrink-0" aria-hidden="true"/>
            Immigration rules, fees and timelines may change. Always refer to the official linked authority for the latest requirements before making an application.
          </p>
        </div>
      </section>

      <section aria-labelledby="visa-faq-title" className="section-space">
        <div className="container-wide grid gap-10 lg:grid-cols-[.65fr_1.35fr]">
          <div>
            <p className="eyebrow">Helpful answers</p>
            <h2 id="visa-faq-title" className="mt-4 text-[clamp(1.8rem,3vw,2.7rem)] font-medium tracking-[-.04em] text-navy">Visa assistance FAQs</h2>
            <p className="mt-4 text-sm leading-7 text-muted">Answers to common questions from travellers in Nigeria.</p>
            <Link href="/request?service=visa"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-sapphire px-6 text-[13px] font-medium text-white hover:bg-[#0647b8]">
              Request visa assistance <ArrowUpRight size={15} aria-hidden="true"/>
            </Link>
          </div>
          <div className="space-y-3">
            {questions.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-[#e3eaf2] bg-white px-5 py-4 open:border-[#c7d9f2] open:bg-[#f9fbff]">
                <summary className="min-h-9 cursor-pointer list-item pr-3 text-[14px] font-medium leading-6 text-navy marker:text-sapphire">{q}</summary>
                <p className="mt-2 border-t border-[#e9eef5] pt-3 text-[13px] leading-7 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
        <div className="container-wide mt-8 flex items-start gap-3 rounded-xl bg-[#f1f6ff] p-5 text-[#40587e]">
          <ShieldCheck size={20} className="mt-1 shrink-0 text-sapphire" aria-hidden="true"/>
          <p className="text-[12px] leading-6">Sapphire Quest provides travel assistance, not immigration decisions. Submitting an enquiry does not confirm a visa application, appointment or approval.</p>
        </div>
      </section>
    </>
  );
}
