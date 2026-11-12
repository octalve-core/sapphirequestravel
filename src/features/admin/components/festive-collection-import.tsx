"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

export function FestiveCollectionImport() {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  async function importCollection() {
    setWorking(true);
    setError(false);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/packages/seasonal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data: { ok?: boolean; error?: string; message?: string } = await response.json();
      if (!response.ok || !data.ok) {
        setError(true);
        setFeedback(data.error || "The collection could not be imported.");
        return;
      }
      setFeedback(data.message || "Collection added.");
      router.refresh();
    } catch {
      setError(true);
      setFeedback("Connection unavailable. Please try again.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="mb-9 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-[#d8e5f5] bg-[#f4f8ff] p-6">
      <div className="max-w-xl">
        <p className="text-[13px] font-medium text-navy">Festive travel collection · 2026/27</p>
        <p className="mt-2 text-[12px] leading-6 text-muted">
          Add the five curated journeys to your editor to adjust prices, upload photos and refine itineraries.
          Packages already in your editor will not be overwritten.
        </p>
        {feedback && (
          <p role="status" className={"mt-3 text-[12px] " + (error ? "text-red-700" : "text-green-700")}>
            {feedback}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={working}
        onClick={importCollection}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-sapphire px-5 text-[12px] font-medium text-white disabled:opacity-60"
      >
        {working ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
        {working ? "Adding collection..." : "Add five packages to editor"}
      </button>
    </div>
  );
}
