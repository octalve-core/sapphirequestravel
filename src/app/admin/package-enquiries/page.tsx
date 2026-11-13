import type { Metadata } from "next";
import { PackageEnquiriesSection } from "@/features/admin/sections/package-enquiries-section";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Package enquiries", robots: { index: false, follow: false } };
export default function PackageEnquiriesPage({searchParams}: {searchParams: Promise<Record<string,string|string[]|undefined>>}) {
  return <PackageEnquiriesSection searchParams={searchParams}/>;
}
