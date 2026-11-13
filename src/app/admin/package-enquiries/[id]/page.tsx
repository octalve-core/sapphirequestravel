import type { Metadata } from "next";
import { PackageEnquiryDetailSection } from "@/features/admin/sections/package-enquiry-detail-section";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Package request details", robots: { index: false, follow: false } };
export default async function PackageEnquiryDetailPage({params}: {params:Promise<{id:string}>}) {
  const {id} = await params;
  return <PackageEnquiryDetailSection id={id}/>;
}
