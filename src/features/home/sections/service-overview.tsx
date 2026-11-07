import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * Full-bleed editorial travel photography. Unsplash free-use photographs
 * (see docs/IMAGE_SOURCES.md); cards remain ordinary accessible links.
 */
const services = [
  {
    title: "Flights, made simple",
    desc: "Domestic and international flights and itinerary coordination.",
    action: "Explore flights",
    href: "/request?service=flight",
    photo: "/images/service-flights.webp",
    alt: "Passenger aircraft at an airport gate in warm evening light",
  },
  {
    title: "Visa assistance",
    desc: "Document preparation and guidance for visa applications.",
    action: "Visa support",
    href: "/visa-assistance",
    photo: "/images/service-visa.webp",
    alt: "Travel planning map and personal travel essentials",
  },
  {
    title: "Business & delegation travel",
    desc: "Thoughtful travel coordination for institutions and teams.",
    action: "Corporate travel",
    href: "/corporate-travel",
    photo: "/images/service-corporate.webp",
    alt: "Contemporary business interior with an editorial architectural perspective",
  },
  {
    title: "Trips worth taking",
    desc: "Personal journeys planned around your interests.",
    action: "Explore destinations",
    href: "/destinations",
    photo: "/images/service-holidays.webp",
    alt: "Scenic Mediterranean coast and travel destination",
  },
] as const;

export function ServiceOverview() {
  return (
    <section aria-labelledby="home-services-heading" className="section-space bg-white">
      <div className="container-wide">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">What we do</p>
            <h2 id="home-services-heading" className="display-heading mt-4 max-w-[750px] text-[clamp(1.44rem,2.76vw,2.7rem)]">
              Travel services, shaped<br className="hidden md:block"/> around you.
            </h2>
          </div>
          <p className="max-w-[350px] text-sm leading-7 text-muted">
            The details matter. We simplify them so you can focus on what matters most.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:mt-12 xl:grid-cols-4 xl:gap-5">
          {services.map((service, index) => (
            <Link
              key={service.href}
              href={service.href}
              aria-label={`${service.title}: ${service.action}`}
              className="group relative isolate flex min-h-[350px] flex-col justify-end overflow-hidden rounded-[22px] bg-[#102a4c] text-white shadow-[0_12px_36px_rgba(7,28,59,.08)] transition-shadow duration-300 hover:shadow-[0_22px_60px_rgba(7,28,59,.18)] focus-visible:outline-offset-4 sm:min-h-[395px] xl:min-h-[410px]"
            >
              <Image
                src={service.photo}
                alt={service.alt}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.075] group-focus-visible:scale-[1.075] motion-reduce:transform-none"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-black/20"/>
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5 transition-colors duration-300"/>
              <span className="relative z-10 block p-6 sm:p-7">
                <span className="mb-5 block text-[11px] font-medium tracking-[.18em] text-white/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="block max-w-[270px] text-[clamp(1.18rem,1.6vw,1.52rem)] font-medium leading-[1.25] tracking-[-.035em]">{service.title}</span>
                <span className="sr-only">{service.desc}</span>
                <span className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/45 bg-white/15 px-4 text-[12px] font-medium text-white backdrop-blur-sm transition-all duration-300 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100">
                  {service.action}<ArrowUpRight aria-hidden="true" size={15}/>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
