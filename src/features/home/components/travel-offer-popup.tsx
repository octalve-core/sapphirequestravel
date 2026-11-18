"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";

/** User-supplied Sapphire Quest promotional artwork. Not a discount or live flight fare. */
const promotion = {
  id: "sapphire-travel-campaign-nov-2026",
  enabled: true,
  image: "/images/sapphire-quest-travel-banner.webp",
  href: "/request",
} as const;
const sessionKey = "sq-campaign-seen:" + promotion.id;

export function TravelOfferPopup() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  useEffect(() => {
    if (!promotion.enabled) return;
    try { if (window.sessionStorage.getItem(sessionKey) === "1") return; }
    catch { /* Storage may be unavailable in private browsing. */ }
    const timer = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog || document.visibilityState !== "visible" || document.querySelector("dialog[open]")) return;
      dialog.showModal();
      try { window.sessionStorage.setItem(sessionKey, "1"); }
      catch { /* The popup remains dismissible without storage. */ }
    }, 2800);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <dialog ref={dialogRef} aria-labelledby="sapphire-campaign-title"
      onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
      className="m-auto w-[min(92vw,810px)] max-w-none max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[22px] border-0 bg-[#052969] p-0 text-white shadow-[0_40px_100px_rgba(0,7,25,.45)] backdrop:bg-[#030b1c]/70 backdrop:backdrop-blur-[3px]">
      <h2 id="sapphire-campaign-title" className="sr-only">Discover Sapphire Quest travel services</h2>
      <div className="relative isolate overflow-hidden rounded-[22px]">
        <Link href={promotion.href} onClick={() => dialogRef.current?.close()} aria-label="Plan a trip with Sapphire Quest"
          className="block focus-visible:outline-offset-[-4px]">
          {!imageUnavailable ? (
            <Image src={promotion.image} width={1672} height={941} priority={false}
              alt="Fly the world with Sapphire Quest. Flights, visa assistance and travel packages. Book your trip today."
              onError={() => setImageUnavailable(true)} sizes="(max-width: 640px) 92vw, 810px" className="block h-auto w-full"/>
          ) : (
            <div className="bg-[linear-gradient(130deg,#003079,#0755db_65%,#062251)] px-7 py-14 sm:px-12 sm:py-20">
              <p className="text-[12px] font-medium uppercase tracking-[.16em] text-[#f0c878]">Sapphire Quest Travels &amp; Tours</p>
              <p className="mt-5 max-w-[620px] text-[clamp(2rem,5vw,3.7rem)] font-medium leading-[1.12] tracking-[-.045em]">Fly the world with Sapphire Quest.</p>
              <p className="mt-5 max-w-[570px] text-[14px] leading-7 text-white/85">Flight enquiries, visa assistance, curated travel packages and support for your next journey.</p>
              <span className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#eeaa17] px-6 text-[13px] font-medium text-[#061833]">Book Your Trip Today <ArrowUpRight size={16} aria-hidden="true"/></span>
            </div>
          )}
        </Link>
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close travel offer"
          className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white text-[#122646] shadow-lg hover:bg-[#edf4ff] focus-visible:outline-offset-2 sm:right-5 sm:top-5">
          <X size={20} aria-hidden="true"/>
        </button>
      </div>
    </dialog>
  );
}
