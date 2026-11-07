import { ButtonLink } from "@/components/ui/button";
import { RichTextRenderer } from "@/features/packages/components/rich-text-renderer";
import { PackagePrice } from "@/features/packages/components/package-price";
import { PackageImage } from "@/features/packages/components/package-image";
import { CheckCircle2 } from "lucide-react";
import type { PackageRecord } from "@/server/package-schema";
export function PackageDetails({item}:{item:PackageRecord}) {return <section className="section-space"><div className="container-wide grid items-start gap-12 lg:grid-cols-[1.3fr_.7fr]"><div className="space-y-10">
  <div className="grid grid-cols-2 gap-3">{(item.images.length?item.images:[""]).map((src,i)=><div key={`${src}-${i}`} className={`aspect-[5/3] overflow-hidden rounded-2xl ${i===0?"col-span-2":""}`}><PackageImage src={src} alt={`Travel package: ${item.title} image ${i+1}`}/></div>)}</div>
  {item.highlights&&<div><h2 className="mb-4 text-xl font-medium text-navy">At a glance</h2><p className="text-sm leading-8 text-muted">{item.highlights}</p></div>}
  {item.features.length>0&&<div><h2 className="mb-5 text-xl font-medium text-navy">Package features</h2><ul className="grid gap-4 sm:grid-cols-2">{item.features.map(f=><li key={f} className="flex items-start gap-3 text-sm leading-6 text-[#42546d]"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-sapphire"/>{f}</li>)}</ul></div>}
  {item.details.blocks.length>0&&<div><h2 className="mb-5 text-xl font-medium text-navy">More details</h2><RichTextRenderer content={item.details}/></div>}
  </div><aside className="surface-card sticky top-6 p-7"><p className="eyebrow">Your journey, your way</p><h2 className="mt-4 text-2xl font-medium">Let's make it yours.</h2><div className="mt-6"><PackagePrice amount={item.priceAmount} currency={item.currency} discount={item.discountPercent}/></div><p className="mt-5 text-sm leading-7 text-muted">Prices and availability are subject to a personalised written quote. Our team will confirm inclusions, dates and conditions before any commitment.</p><ButtonLink href={`/request?service=holiday&package=${encodeURIComponent(item.slug)}`} className="mt-7 w-full justify-center">Enquire about this package</ButtonLink></aside>
 </div></section>}
