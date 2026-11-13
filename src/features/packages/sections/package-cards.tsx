import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Plane, MessageCircle } from "lucide-react";
import { publicPackageCatalog } from "@/server/package-catalog";
import { PackageRating } from "@/features/packages/components/package-rating";
import { PackagePrice } from "@/features/packages/components/package-price";
import { PackageImage } from "@/features/packages/components/package-image";

function daysAndNights(highlights: string) {
  const matched = highlights.match(/(\d+)\s+days?\s*[·/-]\s*(\d+)\s+nights?/i);
  return matched ? matched[1] + " days · " + matched[2] + " nights" : "Flexible itinerary";
}

export async function PackageCards() {
  const packages = await publicPackageCatalog();
  return (
    <section className="section-space" aria-labelledby="travel-collection-heading">
      <div className="container-wide">
        <div className="mb-10 max-w-2xl">
          <p className="eyebrow">The Sapphire Quest collection</p>
          <h2 id="travel-collection-heading" className="display-heading mt-4 text-3xl text-navy sm:text-4xl">
            Your next story starts here.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted">Explore handpicked journeys and request a quote for your preferred dates.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((item) => (
            <article key={item.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e8edf4] bg-white shadow-[0_12px_32px_-22px_rgba(7,27,60,.3)] transition-shadow hover:shadow-[0_18px_38px_-18px_rgba(7,27,60,.22)]">
              <Link href={"/packages/" + item.slug} aria-label={"View " + item.title} className="relative block aspect-[16/10] overflow-hidden bg-[#edf4fd]">
                <PackageImage src={item.images[0] || item.details.home?.image} alt={item.title} className="transition-transform duration-500 group-hover:scale-105" />
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-sapphire">
                  <MapPin size={14} aria-hidden="true"/> {item.destination}
                </p>
                <h3 className="mt-2 min-h-[54px] text-[21px] font-medium leading-[1.25] tracking-[-.035em] text-navy">
                  <Link href={"/packages/" + item.slug} className="hover:text-sapphire">{item.title}</Link>
                </h3>
                <div className="mt-3">
                  <PackageRating score={item.ratingScore} count={item.ratingCount} source={item.ratingSource} />
                </div>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-[#52657f]">
                  <span className="flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true"/>{daysAndNights(item.highlights)}</span>
                  <span className="flex items-center gap-1.5"><Plane size={14} aria-hidden="true"/>Lagos departure</span>
                </div>
                <div className="mt-auto pt-6">
                  <div className="border-t border-[#e8edf4] pt-5">
                    <PackagePrice amount={item.priceAmount} currency={item.currency} discount={item.discountPercent} />
                    <p className="mt-1 text-[11px] text-muted">Per adult sharing</p>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link href={"/packages/" + item.slug + "#package-enquiry"} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-sapphire px-3 text-[12px] font-medium text-sapphire hover:bg-[#f3f7ff]">
                      <MessageCircle size={15} aria-hidden="true"/> Get quote
                    </Link>
                    <Link href={"/packages/" + item.slug} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-sapphire px-3 text-[12px] font-medium text-white hover:bg-[#0747ac]">
                      View trip <ArrowUpRight size={15} aria-hidden="true"/>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-[12px] leading-6 text-muted">
          Your travel adviser confirms available arrangements and the full trip total before payment.
        </p>
      </div>
    </section>
  );
}
