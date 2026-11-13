"use client";
import { useState } from "react";
import { Check, Copy, Printer } from "lucide-react";

/** Two real local actions. No external sharing or new permissions required. */
export function EnquiryDetailTools({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  async function copyReference() {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }
  const buttonStyle = "inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d9e4f2] bg-white px-3 text-[12px] font-medium text-[#385377] hover:border-sapphire hover:text-sapphire";
  return <div className="enquiry-detail-tools flex flex-wrap items-center gap-2 print:hidden">
    <button type="button" onClick={()=>void copyReference()} className={buttonStyle} aria-label="Copy enquiry reference">
      {copied ? <Check size={15} aria-hidden="true"/> : <Copy size={15} aria-hidden="true"/>}
      {copied ? "Copied" : "Copy ref"}
    </button>
    <button type="button" onClick={()=>window.print()} className={buttonStyle} aria-label="Print enquiry details">
      <Printer size={15} aria-hidden="true"/> Print
    </button>
    {copyError && <span role="alert" className="text-[11px] text-red-700">Copy failed. Select the reference manually.</span>}
  </div>;
}
