import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { publicPackageCatalog } from "@/server/package-catalog";
import { PackagePrice } from "@/features/packages/components/package-price";
import { PackageImage } from "@/features/packages/components/package-image";

export async function PackageCards() {
  const packages = await publicPackageCatalog();
  return (
    <section className="section-space" aria-labelledby="travel-collection-heading">
      <div className="container-wide">
        <div className="mb-11 max-w-3xl">
          <p className="eyebrow">Festive collection · December 2026 – January 2027</p>
          <h2 id="travel-collection-heading" className="display-heading mt-4 text-3xl text-navy sm:text-4xl">
            Your next story starts here.
          </h2>
          <p className="mt-5 max-w-[640px] text-sm leading-7 text-muted">
            From vibrant city celebrations to peaceful island mornings, choose the experience that feels like you.
            Our travel specialists bring together the itinerary, stays and thoughtful details.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((item) => (
            <Link
              href={"/packages/" + item.slug}
              key={item.id}
              className="group surface-card overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#e8eef8]">
                <PackageImage
                  src={item.images?.[0]}
                  alt={item.title + " travel experience"}
                  className="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-7">
                <p className="flex items-center gap-2 text-[12px] font-medium text-sapphire">
                  <MapPin size={14} aria-hidden="true" /> {item.destination}
                </p>
                <h3 className="mt-3 text-[21px] font-medium leading-snug tracking-[-.035em] text-navy">
                  {item.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-[13px] leading-7 text-muted">{item.summary}</p>
                <div className="mt-6 border-t border-[#e9edf3] pt-5">
                  <PackagePrice amount={item.priceAmount} currency={item.currency} discount={item.discountPercent}/>
                  <p className="mt-1 text-[11px] text-muted">Per adult sharing · Lagos departure</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-sapphire">
                  Discover this journey <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-[12px] leading-6 text-muted">
          Each escape is planned around your chosen departure date. Your travel adviser will confirm the itinerary,
          accommodation and full trip total before you make payment.
        </p>
      </div>
    </section>
  );
}
