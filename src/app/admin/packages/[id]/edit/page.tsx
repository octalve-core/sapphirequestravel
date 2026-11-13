import type { Metadata } from "next";
import { FullPagePackageEditor } from "@/features/admin/sections/full-page-package-editor";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit package", robots: { index: false, follow: false } };
export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FullPagePackageEditor id={id} />;
}
