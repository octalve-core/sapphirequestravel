import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { PackageDetails } from "@/features/packages/sections/package-details";
import { db } from "@/server/db";
import { emptyPackage, type PackageRecord } from "@/server/package-schema";
export const dynamic="force-dynamic";export const metadata:Metadata={title:"Travel package"};
export default async function PackageDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;if(!/^[a-z0-9-]{1,130}$/.test(slug))notFound();
 let record:PackageRecord|undefined;
 try{const sql=db();const rows=await sql`SELECT id,title,slug,summary,destination,status,highlights,price_amount::float AS "priceAmount",currency,discount_percent AS "discountPercent",features,images,details FROM travel_packages WHERE slug=${slug} AND status='published' LIMIT 1`;record=rows[0] as PackageRecord|undefined}
 catch{try{const sql=db();const old=await sql`SELECT id,title,slug,summary,destination,status FROM travel_packages WHERE slug=${slug} AND status='published' LIMIT 1`;if(old[0])record={...emptyPackage(),...(old[0] as unknown as PackageRecord)}}catch{}}
 if(!record)notFound();
 return <MarketingLayout><PageHero image={record.images?.[0]||"/images/coastal.webp"} eyebrow={record.destination} title={record.title} description={record.summary}/><PackageDetails item={record}/></MarketingLayout>
}
