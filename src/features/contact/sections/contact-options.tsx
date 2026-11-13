import { ArrowUpRight, Instagram, Mail, MessageCircle, PhoneCall } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/config/brand";

const contactMethods = [
  { label: "Email us", value: brand.email, href: "mailto:" + brand.email, icon: Mail },
  { label: "Call our team", value: brand.phoneDisplay, href: "tel:" + brand.phone, icon: PhoneCall },
  { label: "Instagram", value: brand.socialHandle, href: brand.instagram, icon: Instagram, external: true },
] as const;

export function ContactOptions() {
  return (
    <section className="section-space bg-white" aria-labelledby="contact-methods-heading">
      <div className="container-wide grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="rounded-[24px] border border-[#e2e9f3] bg-white p-6 shadow-[0_16px_45px_-32px_rgba(7,28,59,.3)] sm:p-9 lg:p-10">
          <p className="eyebrow">We&apos;re here to help</p>
          <h2 id="contact-methods-heading" className="mt-3 text-[clamp(1.5rem,2.5vw,2rem)] font-medium tracking-[-.045em] text-navy">
            Get in touch
          </h2>
          <p className="mt-3 max-w-md text-[13px] leading-7 text-muted">
            Speak with our team about your next journey.
          </p>
          <div className="mt-7 divide-y divide-[#e8edf4]">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <a key={method.label} href={method.href}
                  target={"external" in method && method.external ? "_blank" : undefined}
                  rel={"external" in method && method.external ? "noopener noreferrer" : undefined}
                  className="group flex min-w-0 items-center gap-4 py-5 first:pt-0 last:pb-0">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-[#edf4ff] text-sapphire transition-colors group-hover:bg-[#dbeaff]">
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true"/>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-medium uppercase tracking-[.12em] text-muted">{method.label}</span>
                    <span className="mt-1 block break-words text-[14px] font-medium text-navy sm:text-[15px]">{method.value}</span>
                  </span>
                  <ArrowUpRight size={17} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-sapphire"/>
                </a>
              );
            })}
          </div>
          <a href={"https://wa.me/" + brand.phone.replace(/\D/g, "")}
            target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-[#d6e4f5] px-5 text-[12px] font-medium text-sapphire transition-colors hover:bg-[#f3f7ff]">
            <MessageCircle size={17} strokeWidth={1.7} aria-hidden="true" />
            Chat on WhatsApp <ArrowUpRight size={14} aria-hidden="true"/>
          </a>
        </div>
        <div className="relative flex min-h-[420px] flex-col justify-center overflow-hidden rounded-[24px] bg-[#082750] p-7 text-white sm:p-10 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border border-white/10"/>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-8 size-72 rounded-full bg-[#0755db]/20 blur-3xl"/>
          <div className="relative">
            <p className="text-[11px] font-medium uppercase tracking-[.17em] text-[#bfd8ff]">Start planning</p>
            <h2 className="display-heading mt-4 max-w-md text-[clamp(2rem,3.5vw,3.15rem)]">Where will your next journey take you?</h2>
            <p className="mt-6 max-w-md text-[14px] leading-7 text-white/80">
              Tell us your preferred destination, travel dates and requirements. We&apos;ll help you explore suitable arrangements.
            </p>
            <ButtonLink href="/request" variant="light" className="mt-9">Start your enquiry <ArrowUpRight size={16} aria-hidden="true"/></ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
