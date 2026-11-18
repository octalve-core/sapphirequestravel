"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X } from "lucide-react";
import type { PublicBanner } from "@/features/home/lib/banner-contract";

export function TravelOfferPopup() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [banner, setBanner] = useState<PublicBanner | null>(null);
  const [imageUnavailable, setImageUnavailable] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/public/banner", { signal: controller.signal, cache: "no-store" })
      .then((response) => response.ok ? response.json() as Promise<{ banner?: PublicBanner | null }> : null)
      .then((payload) => {
        if (!controller.signal.aborted && payload?.banner?.fileId && payload.banner.imageUrl) {
          setBanner(payload.banner);
        }
      })
      .catch(() => { /* A banner outage must not interrupt booking and navigation. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!banner) return;
    const key = "sq-campaign-seen:" + banner.fileId;
    try {
      if (window.sessionStorage.getItem(key) === "1") return;
    } catch { /* Keep the dialog dismissible when storage is unavailable. */ }
    const timer = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog || document.visibilityState !== "visible" || document.querySelector("dialog[open]")) return;
      dialog.showModal();
      try { window.sessionStorage.setItem(key, "1"); }
      catch { /* Private mode may block session storage. */ }
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [banner]);

  if (!banner) return null;
  return (
    <dialog ref={dialogRef} aria-labelledby="sapphire-campaign-title"
      onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}
      className="m-auto w-[min(92vw,810px)] max-w-none max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[22px] border-0 bg-[#052969] p-0 text-white shadow-[0_40px_100px_rgba(0,7,25,.45)] backdrop:bg-[#030b1c]/70 backdrop:backdrop-blur-[3px]">
      <h2 id="sapphire-campaign-title" className="sr-only">{banner.title}</h2>
      <div className="relative isolate overflow-hidden rounded-[22px]">
        <Link href={banner.href} onClick={() => dialogRef.current?.close()}
          aria-label={"Discover: " + banner.title} className="block focus-visible:outline-offset-[-4px]">
          {!imageUnavailable ? (
            <Image src={banner.imageUrl} width={banner.width ?? 1600} height={banner.height ?? 900}
              unoptimized priority={false} alt={banner.title}
              onError={() => setImageUnavailable(true)}
              sizes="(max-width: 640px) 92vw, 810px" className="block h-auto w-full"/>
          ) : (
            <div className="bg-[linear-gradient(130deg,#003079,#0755db_65%,#062251)] px-7 py-14 sm:px-12 sm:py-20">
              <p className="text-[12px] font-medium uppercase tracking-[.16em] text-[#f0c878]">Sapphire Quest Travels &amp; Tours</p>
              <p className="mt-5 max-w-[620px] text-[clamp(2rem,5vw,3.7rem)] font-medium leading-[1.12] tracking-[-.045em]">{banner.title}</p>
              <span className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#eeaa17] px-6 text-[13px] font-medium text-[#061833]">
                Explore this offer <ArrowUpRight size={16} aria-hidden="true"/>
              </span>
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
