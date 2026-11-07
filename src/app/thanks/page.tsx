import { MarketingLayout } from "@/components/layout/marketing-layout";
import { ThankYou } from "@/features/thanks/sections/thank-you";
import type { Metadata } from "next";
export const metadata:Metadata={title:"Thank you",robots:{index:false,follow:false}};
export default async function Thanks({searchParams}:{searchParams:Promise<{ref?:string}>}){const p=await searchParams;const ref=typeof p.ref==="string"&&/^SQ-[A-Z0-9-]{8,28}$/.test(p.ref)?p.ref:null;return <MarketingLayout><ThankYou reference={ref}/></MarketingLayout>}
