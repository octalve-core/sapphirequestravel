import type { Metadata } from "next";
import { PackagesWorkspace } from "@/features/admin/sections/packages-workspace";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Packages CMS",robots:{index:false,follow:false}};
export default function Packages(){return <PackagesWorkspace/>}
