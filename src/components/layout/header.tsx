"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { ButtonLink } from "@/components/ui/button";
import { navItems } from "@/config/brand";
export function Header(){ const [open,setOpen]=useState(false); return <header className="relative z-50 border-b border-[#edf0f6] bg-white/95 backdrop-blur-md">
 <div className="container-wide flex h-[88px] items-center justify-between gap-8">
  <BrandMark/>
  <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">{navItems.map(i=><Link key={i.href} href={i.href} className="text-[13px] font-medium text-[#465469] transition-colors hover:text-sapphire">{i.label}</Link>)}</nav>
  <div className="hidden items-center gap-4 lg:flex"><ButtonLink href="/request" className="min-h-11">Plan your trip <ArrowUpRight size={15}/></ButtonLink></div>
  <button type="button" className="rounded-lg p-2 lg:hidden" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
 </div>
 {open&&<nav aria-label="Mobile navigation" className="border-t border-[#edf0f6] bg-white p-5 lg:hidden"><div className="container-wide flex flex-col gap-1">{navItems.map(i=><Link key={i.href} href={i.href} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-[#f5f7fb]" onClick={()=>setOpen(false)}>{i.label}</Link>)}<Link href="/request" className="mt-2 rounded-full bg-sapphire px-5 py-3 text-center text-sm font-semibold text-white" onClick={()=>setOpen(false)}>Plan your trip</Link></div></nav>}
 </header> }
