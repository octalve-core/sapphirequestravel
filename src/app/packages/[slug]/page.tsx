import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { PageHero } from "@/components/layout/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { db } from "@/server/db";
export const dynamic="force-dynamic";export const metadata:Metadata={title:"Travel package"};
export default async function PackageDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!/^[a-z0-9-]{1,130}$/.test(slug))notFound();let p:{title:string,destination:string,summary:string}|undefined;try{const sql=db();const rows=await sql`SELECT title,destination,summary FROM travel_packages WHERE slug=${slug} AND status='published' LIMIT 1`;p=rows[0] as typeof p}catch{notFound()}if(!p)notFound();return <MarketingLayout><PageHero eyebrow={p.destination} title={p.title} description={p.summary}/><section className="section-space"><div className="container-wide max-w-3xl"><h2 className="text-3xl font-medium">Let's make it yours.</h2><p className="mt-5 text-sm leading-8 text-muted">Availability, dates, accommodation, inclusions and pricing are provided by our team when you enquire. Nothing is reserved or charged by viewing this package.</p><ButtonLink href="/request?service=holiday" className="mt-8">Enquire about this package</ButtonLink></div></section></MarketingLayout>}
