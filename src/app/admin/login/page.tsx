import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Plane } from "lucide-react";
import { currentStaff } from "@/server/auth";
import { LoginForm } from "@/features/admin/components/login-form";
export const dynamic="force-dynamic";export const metadata:Metadata={title:"Team sign in",robots:{index:false,follow:false}};
export default async function LoginPage(){if(await currentStaff())redirect("/admin");return <div className="grid min-h-screen lg:grid-cols-2"><div className="flex items-center justify-center bg-white px-6 py-16"><div className="w-full max-w-[430px]"><Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-[-.045em] text-navy"><Plane className="-rotate-45 text-sapphire"/> Sapphire Quest</Link><p className="eyebrow mt-16">Private workspace</p><h1 className="display-heading mt-4 text-4xl sm:text-5xl">Welcome back.</h1><p className="mt-4 text-sm leading-7 text-muted">Sign in to manage customer enquiries and travel operations.</p><LoginForm/></div></div><div className="relative hidden bg-[#061b3c] lg:block"><div className="absolute inset-0 bg-[url('/images/hero-runway.webp')] bg-cover bg-center"/><div className="absolute inset-0 bg-[#061b3c]/55"/><div className="absolute bottom-20 left-16 max-w-md text-white"><p className="text-xs uppercase tracking-[.2em] text-white/70">The details matter</p><p className="display-heading mt-5 text-5xl">Behind every great journey is thoughtful coordination.</p></div></div></div>}
