import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { brand } from "@/config/brand";

const explore = [
  { label: "Destinations", href: "/destinations" },
  { label: "Travel packages", href: "/packages" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

const services = [
  { label: "Flights", href: "/request?service=flight" },
  { label: "Visa assistance", href: "/request?service=visa" },
  { label: "Tours & holidays", href: "/request?service=holiday" },
  { label: "Corporate travel", href: "/request?service=corporate" },
] as const;

const resources = [
  { label: "Plan your trip", href: "/request" },
  { label: "Travel services", href: "/services" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of service", href: "/terms" },
] as const;

const socialLinks = [
  { label: "Instagram", href: brand.instagram, Icon: Instagram },
  { label: "WhatsApp", href: "https://wa.me/2349162974349", Icon: MessageCircle },
  { label: "Email Sapphire Quest", href: `mailto:${brand.email}`, Icon: Mail },
  { label: "Call Sapphire Quest", href: `tel:${brand.phone}`, Icon: Phone },
] as const;

function FooterColumn({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[13px] font-medium text-white">{title}</h3>
      <ul className="mt-6 space-y-4">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="group inline-flex items-center gap-2 text-[13px] leading-6 text-[#b6c8e1] transition-colors hover:text-white focus-visible:text-white"
            >
              <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.75} className="shrink-0 text-[#2682ff] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Full-width, editorial footer modelled after the spacious Octalve Vault layout. */
export function Footer() {
  return (
    <footer className="bg-[#000000] text-white">
      <div className="container-wide pt-16 pb-7 sm:pt-20 lg:pt-24">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div className="max-w-[840px]">
            <p className="text-[10px] font-medium uppercase tracking-[.24em] text-[#9bb8dd]">Sapphire Quest Travels &amp; Tours Ltd</p>
            <h2 className="mt-5 text-[clamp(1.85rem,3.6vw,3.5rem)] font-medium leading-[1.18] tracking-[-.053em] text-white">
              Your journey, <span className="text-[#2785ff]">thoughtfully planned</span><span className="text-white"> from the very first step.</span>
            </h2>
          </div>
          <nav aria-label="Connect with Sapphire Quest" className="flex shrink-0 flex-wrap gap-2.5">
            {socialLinks.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} target={href.startsWith("https://") ? "_blank" : undefined} rel={href.startsWith("https://") ? "noopener noreferrer" : undefined}
                className="flex size-11 items-center justify-center rounded-full border border-[#2480ef]/40 bg-[#0863df] text-white transition-colors hover:border-[#77b5ff] hover:bg-[#1879fa] focus-visible:outline-offset-4">
                <Icon aria-hidden="true" size={18} strokeWidth={1.75}/>
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-12 border-b border-white/10 pb-14 sm:mt-20 md:grid-cols-3 lg:mt-24 lg:grid-cols-[1.65fr_.9fr_1fr_.95fr_1.12fr] lg:gap-x-10 lg:pb-20">
          <div className="col-span-2 max-w-[330px] sm:col-span-1">
            <BrandMark inverse />
            <p className="mt-7 text-[13px] leading-7 text-[#b6c8e1]">
              Considered travel arrangements for individuals, families, institutions and teams. From first enquiry to a more confident itinerary.
            </p>
          </div>

          <FooterColumn title="Explore" links={explore} />
          <FooterColumn title="Travel services" links={services} />
          <FooterColumn title="Support & legal" links={resources} />

          <div className="col-span-2 sm:col-span-1">
            <h3 className="text-[13px] font-medium text-white">Get in touch</h3>
            <div className="mt-6 space-y-5 text-[13px] leading-6 text-[#b6c8e1]">
              <a className="flex items-start gap-2.5 break-all transition-colors hover:text-white" href={`mailto:${brand.email}`}>
                <Mail aria-hidden="true" size={15} className="mt-1 shrink-0 text-[#2785ff]"/>{brand.email}
              </a>
              <a className="flex items-start gap-2.5 transition-colors hover:text-white" href={`tel:${brand.phone}`}>
                <Phone aria-hidden="true" size={15} className="mt-1 shrink-0 text-[#2785ff]"/>{brand.phoneDisplay}
              </a>
              <a className="inline-flex items-center gap-2.5 transition-colors hover:text-white" href={brand.instagram} target="_blank" rel="noopener noreferrer">
                <Instagram aria-hidden="true" size={15} className="shrink-0 text-[#2785ff]"/>{brand.socialHandle}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 pt-7 text-[11px] leading-6 text-[#9bb2cf] sm:flex-row sm:items-center">
          <p>© {new Date().getUTCFullYear()} Sapphire Quest Travels &amp; Tours Ltd. All rights reserved.</p>
          <p>
            Developed By{" "}
            <a href="https://www.octalve.com" target="_blank" rel="noopener noreferrer"
              className="font-medium text-[#2886ff] underline-offset-4 transition-colors hover:text-[#78b6ff] hover:underline">
              Octalve Holding
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
