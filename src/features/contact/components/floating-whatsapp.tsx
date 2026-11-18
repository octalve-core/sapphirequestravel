"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MessageCircle, X } from "lucide-react";
import { brand } from "@/config/brand";
import { whatsappLink } from "@/lib/whatsapp-link";

const topics = [
  { label: "Flight enquiries", message: "Hello Sapphire Quest, I would like help with a flight enquiry." },
  { label: "Visa assistance", message: "Hello Sapphire Quest, I would like to enquire about visa assistance." },
  { label: "Travel packages", message: "Hello Sapphire Quest, I would like to know more about your travel packages." },
] as const;

export function FloatingWhatsApp() {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target)) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end sm:bottom-7 sm:right-7">
      {open && (
        <section id="sapphire-whatsapp-panel" aria-label="Contact Sapphire Quest on WhatsApp"
          className="mb-3 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-[#e6ebf2] bg-white text-navy shadow-[0_18px_65px_rgba(5,27,58,.25)]">
          <div className="flex items-center justify-between bg-[#075a36] px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <MessageCircle size={19} aria-hidden="true"/>
              <div>
                <p className="text-[14px] font-medium">Sapphire Quest</p>
                <p className="text-[11px] text-white/80">WhatsApp travel enquiries</p>
              </div>
            </div>
            <button type="button" aria-label="Close WhatsApp contact panel" onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-white/10 focus-visible:outline-white">
              <X size={18} aria-hidden="true"/>
            </button>
          </div>
          <div className="p-5">
            <p className="text-[13px] leading-6 text-[#475874]">How can we help with your next journey? Choose a topic to start a WhatsApp conversation.</p>
            <div className="mt-4 space-y-2">
              {topics.map((topic) => (
                <a key={topic.label} href={whatsappLink(topic.message)} target="_blank" rel="noopener noreferrer"
                  className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[#e6edf5] px-3.5 text-[12px] font-medium text-[#1e3655] hover:border-[#b3d9c5] hover:bg-[#f4fbf7]">
                  {topic.label}<ArrowUpRight size={15} aria-hidden="true"/>
                </a>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted">Or call us on {brand.phoneDisplay}.</p>
          </div>
        </section>
      )}
      <button ref={trigger} type="button"
        aria-label={open ? "Close WhatsApp chat options" : "Chat with Sapphire Quest on WhatsApp"}
        aria-controls="sapphire-whatsapp-panel" aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-[54px] items-center gap-2.5 rounded-full border border-white/20 bg-[#15834b] px-4 py-3 text-[13px] font-medium text-white shadow-[0_12px_35px_rgba(10,80,45,.28)] transition-colors hover:bg-[#116b3d] focus-visible:outline-[#15834b] focus-visible:outline-offset-4">
        {open ? <X size={21} aria-hidden="true"/> : <MessageCircle size={23} aria-hidden="true"/>}
        <span>WhatsApp</span>
      </button>
    </div>
  );
}
