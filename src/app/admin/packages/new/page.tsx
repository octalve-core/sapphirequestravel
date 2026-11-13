import type { Metadata } from "next";
import { FullPagePackageEditor } from "@/features/admin/sections/full-page-package-editor";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create package", robots: { index: false, follow: false } };
export default function NewPackagePage() { return <FullPagePackageEditor />; }
