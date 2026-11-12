import Image from "next/image";

type Props = { eyebrow: string; title: string; description: string; image?: string; overlay?: "standard" | "deep" };
/** Shared internal hero; selected marketing pages use 80% black while others retain 60%. */
export function PageHero({ eyebrow, title, description, image = "/images/hero-runway.webp", overlay = "standard" }: Props) {
  return <section className="relative isolate overflow-hidden bg-[#081b35] text-white">
    <Image src={image} alt="" fill priority sizes="100vw" unoptimized={image.startsWith("https://") || image.startsWith("http://")} className="object-cover object-center"/>
    <div className={`absolute inset-0 ${overlay === "deep" ? "bg-black/80" : "bg-black/60"}`} aria-hidden="true"/>
    <div className="container-wide relative flex min-h-[360px] flex-col justify-center py-20 sm:min-h-[415px] sm:py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#d9e8ff]">{eyebrow}</p>
      <h1 className="display-heading mt-5 max-w-[950px] text-[clamp(1.9rem,3.35vw,3.5rem)]">{title}</h1>
      <p className="mt-6 max-w-[620px] text-sm leading-7 text-white/85 sm:text-base">{description}</p>
    </div>
  </section>;
}
