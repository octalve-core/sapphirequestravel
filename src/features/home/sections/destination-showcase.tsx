import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { homeFeaturedPackages } from "@/server/home-featured-packages";

/** Same original four image-led homepage tiles, now backed by real package URLs.
 * Package edits, status, order and cover images are read from the package CMS. */
export async function DestinationShowcase() {
  const packages = await homeFeaturedPackages();
  if (!packages.length) return null;
  return (
    <section className="section-space bg-cloud" aria-labelledby="home-featured-heading">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Explore the possibilities</p>
            <h2 id="home-featured-heading" className="display-heading mt-4 text-[clamp(1.41rem,2.88vw,2.7rem)]">
              Where will life take you?
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
              Some journeys begin with a destination. Others begin with an idea. We help you take the next step.
            </p>
          </div>
          <Link href="/packages" className="inline-flex items-center gap-2 border-b border-sapphire pb-1 text-sm font-semibold text-sapphire">
            Explore packages <ArrowUpRight size={16}/>
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {packages.map((item) => {
            const feature = item.details.home!;
            const image = item.images[0] || feature.image;
            return (
              <Link key={item.slug} href={"/packages/" + item.slug}
                aria-label={"Explore " + (feature.title || item.title) + " — " + item.title}
                className="group relative isolate min-h-[355px] overflow-hidden rounded-[24px] bg-[#132845] sm:min-h-[420px]">
                <Image src={image} fill unoptimized={image.startsWith("https://")} sizes="(max-width:768px) 100vw, 50vw"
                  alt={item.title + " featured travel experience"} className="object-cover transition-transform duration-500 group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#06162f]/85 via-[#06162f]/5 to-transparent"/>
                <div className="absolute inset-x-7 bottom-7 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="mb-2 flex items-center gap-2 text-xs text-white/75">
                      <MapPin size={13}/> {feature.label || item.destination}
                    </p>
                    <h3 className="text-3xl font-medium tracking-[-.045em]">{feature.title || item.title}</h3>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-navy transition-transform group-hover:translate-x-1">
                    <ArrowRight size={19}/>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
