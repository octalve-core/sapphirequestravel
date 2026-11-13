import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PackageRecord } from "@/server/package-schema";

/** Backward-compatible directory entry. Package editing now has its own page. */
export function PackageEditor({ data }: { data: PackageRecord }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eef1f5] py-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-navy">{data.title}</p>
        <p className="mt-1 text-xs text-muted">{data.destination} · {data.status}</p>
      </div>
      <Link href={"/admin/packages/" + data.id + "/edit"} className="inline-flex items-center gap-2 rounded-full border border-[#d9e4f4] px-4 py-2 text-xs font-medium text-sapphire">
        Edit package <ArrowUpRight size={15} aria-hidden="true"/>
      </Link>
    </div>
  );
}
