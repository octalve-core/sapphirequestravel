"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { brand } from "@/config/brand";

type Props = { title: string; slug: string; compact?: boolean };
type Feedback = "idle" | "copied" | "manual";

export function PackageShare({ title, slug, compact = false }: Props) {
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const url = new URL("/packages/" + encodeURIComponent(slug), brand.website).toString();
  const whatsappShare = "https://wa.me/?text=" + encodeURIComponent(title + " — " + url);

  async function share() {
    setFeedback("idle");
    if (typeof navigator === "undefined") return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url, text: "Explore this Sapphire Quest travel package." });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setFeedback("copied");
        return;
      } catch { /* Offer manual copying if clipboard access is blocked. */ }
    }
    setFeedback("manual");
  }

  return (
    <div className={compact ? "mt-3" : "mt-5"}>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void share()}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d8e4f3] bg-white px-3.5 text-[12px] font-medium text-[#1c4e96] transition-colors hover:bg-[#f1f6fe]">
          {feedback === "copied" ? <Check size={15} aria-hidden="true"/> : <Share2 size={15} aria-hidden="true"/>}
          {feedback === "copied" ? "Link copied" : compact ? "Share package" : "Share this package"}
        </button>
        <a href={whatsappShare} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#cce6d7] bg-[#f4fbf7] px-3.5 text-[12px] font-medium text-[#126338] hover:bg-[#e9f7ef]">
          <WhatsAppIcon size={15}/> WhatsApp
        </a>
      </div>
      {feedback === "manual" && (
        <div className="mt-2 rounded-lg border border-[#d8e4f3] bg-[#f6f9ff] p-3">
          <label htmlFor={"package-share-" + slug} className="block text-[11px] text-[#4e627f]">Select and copy this package link:</label>
          <div className="mt-2 flex items-center gap-2">
            <Copy size={14} className="shrink-0 text-sapphire" aria-hidden="true"/>
            <input id={"package-share-" + slug} value={url} readOnly onFocus={(event) => event.currentTarget.select()}
              className="w-full min-w-0 bg-transparent text-[12px] text-navy"/>
          </div>
        </div>
      )}
      {feedback === "copied" && <p role="status" className="mt-2 text-[11px] text-[#19673c]">Package link copied to clipboard.</p>}
    </div>
  );
}
