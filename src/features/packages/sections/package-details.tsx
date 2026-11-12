import { ButtonLink } from "@/components/ui/button";
import { RichTextRenderer } from "@/features/packages/components/rich-text-renderer";
import { PackagePrice } from "@/features/packages/components/package-price";
import { PackageImage } from "@/features/packages/components/package-image";
import { CheckCircle2 } from "lucide-react";
import type { PackageRecord } from "@/server/package-schema";

export function PackageDetails({ item }: { item: PackageRecord }) {
  return (
    <section className="section-space">
      <div className="container-wide grid items-start gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(310px,.7fr)] lg:gap-12">
        <div className="min-w-0 space-y-10">
          <div className="grid grid-cols-2 gap-3">
            {(item.images.length ? item.images : [""]).map((src, i) => (
              <div
                key={src + "-" + i}
                className={"relative aspect-[5/3] overflow-hidden rounded-2xl bg-[#eff4fb] " + (i === 0 ? "col-span-2" : "")}
              >
                <PackageImage src={src} alt={item.title + " photo " + (i + 1)} />
              </div>
            ))}
          </div>
          {item.highlights && (
            <div>
              <h2 className="mb-4 text-xl font-medium text-navy">At a glance</h2>
              <p className="text-sm leading-8 text-muted">{item.highlights}</p>
            </div>
          )}
          {item.features.length > 0 && (
            <div>
              <h2 className="mb-5 text-xl font-medium text-navy">What&apos;s included</h2>
              <ul className="grid gap-4 sm:grid-cols-2">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[#42546d]">
                    <CheckCircle2 size={17} aria-hidden="true" className="mt-0.5 shrink-0 text-sapphire" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.details.blocks.length > 0 && (
            <div>
              <h2 className="mb-5 text-xl font-medium text-navy">The experience</h2>
              <RichTextRenderer content={item.details} />
            </div>
          )}
        </div>
        <aside className="surface-card sticky top-28 p-7 sm:p-8">
          <p className="eyebrow">Your next escape</p>
          <h2 className="mt-4 text-2xl font-medium tracking-[-.035em] text-navy">
            Make this journey yours.
          </h2>
          <div className="mt-7">
            <PackagePrice amount={item.priceAmount} currency={item.currency} discount={item.discountPercent} />
            <p className="mt-2 text-[12px] text-muted">Per adult sharing · Lagos departure</p>
          </div>
          <p className="mt-6 text-[13px] leading-7 text-muted">
            Choose your preferred dates and let our team arrange your personalised itinerary, hotel and complete trip total.
          </p>
          <ButtonLink
            href={"/request?service=holiday&package=" + encodeURIComponent(item.slug)}
            className="mt-7 w-full justify-center"
          >
            Plan this experience
          </ButtonLink>
          <p className="mt-4 text-center text-[11px] leading-5 text-muted">
            No payment is needed to enquire.
          </p>
        </aside>
      </div>
    </section>
  );
}
