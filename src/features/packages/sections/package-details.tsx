import { CalendarDays, CheckCircle2, Compass, MapPin, Plane } from "lucide-react";
import { RichTextRenderer } from "@/features/packages/components/rich-text-renderer";
import { PackageImage } from "@/features/packages/components/package-image";
import { PackageQuoteForm } from "@/features/packages/components/package-quote-form";
import { PackageRating } from "@/features/packages/components/package-rating";
import type { PackageRecord } from "@/server/package-schema";

export function PackageDetails({ item }: { item: PackageRecord }) {
  const highlights = item.highlights.split("·").map((x) => x.trim()).filter(Boolean);
  return (
    <section className="section-space">
      <div className="container-wide grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,.65fr)]">
        <div className="min-w-0 space-y-9">
          <div className="grid grid-cols-2 gap-3">
            {(item.images.length ? item.images : [""]).map((src, index) => (
              <div key={src + index} className={"relative aspect-[5/3] overflow-hidden rounded-2xl bg-[#f1f5fb] " + (index === 0 ? "col-span-2" : "")}>
                <PackageImage src={src} alt={item.title + " — photo " + (index + 1)}/>
              </div>
            ))}
          </div>
          <div>
            <PackageRating score={item.ratingScore} count={item.ratingCount} source={item.ratingSource}/>
            <h2 className="mt-4 text-2xl font-medium tracking-[-.035em] text-navy">The experience</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
          </div>
          <div className="rounded-2xl border border-[#e2eaf4] bg-[#f6f9fd] p-6">
            <h2 className="text-lg font-medium text-navy">Trip at a glance</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {highlights.slice(0, 4).map((highlight, index) => {
                const Icon = [CalendarDays, Plane, MapPin, Compass][index];
                return (
                  <div key={index} className="flex items-start gap-3 rounded-xl bg-white p-4">
                    <span className="rounded-full bg-[#e7f1ff] p-2 text-sapphire"><Icon size={16}/></span>
                    <p className="pt-1 text-[12px] font-medium leading-5 text-navy">{highlight}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {item.features.length > 0 && (
            <div>
              <h2 className="mb-5 text-xl font-medium text-navy">Travel highlights & inclusions</h2>
              <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-6 text-[#435571]">
                    <CheckCircle2 size={16} aria-hidden="true" className="mt-1 shrink-0 text-[#238f75]"/> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.details.blocks.length > 0 && (
            <div>
              <h2 className="mb-6 text-xl font-medium text-navy">Your itinerary and travel details</h2>
              <RichTextRenderer content={item.details}/>
            </div>
          )}
        </div>
        <aside id="package-enquiry" className="scroll-mt-28 rounded-2xl border border-[#e1e9f3] bg-white p-6 shadow-[0_14px_34px_-24px_rgba(4,33,76,.25)] sm:p-7 lg:sticky lg:top-28">
          <PackageQuoteForm packageSlug={item.slug} packageTitle={item.title} startingPrice={item.priceAmount} currency={item.currency} discount={item.discountPercent}/>
        </aside>
      </div>
    </section>
  );
}
