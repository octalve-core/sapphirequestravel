import type { Metadata } from "next";
import { AdminOverviewSection } from "@/features/admin/sections/overview-section.tsx";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Operations overview",robots:{index:false,follow:false}};
export default function Admin(){return <AdminOverviewSection/>}
