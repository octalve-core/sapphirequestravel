import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
const variants = { primary: "bg-sapphire text-white hover:bg-[#0646b5]", outline: "border border-[#d5dce8] bg-white text-navy hover:bg-[#f4f7fc]", light: "bg-white text-navy hover:bg-[#e9f0fa]", dark: "bg-navy text-white hover:bg-[#102e5b]" } as const;
type Variant = keyof typeof variants;
const base = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-[-.01em] focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60";
export function Button({variant="primary",className,...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:Variant}){return <button data-slot="button" className={cn(base,variants[variant],className)} {...props}/>}
export function ButtonLink({href,variant="primary",className,children,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{href:string,variant?:Variant,children:ReactNode}){return <Link data-slot="button" href={href} className={cn(base,variants[variant],className)} {...props}>{children}</Link>}
