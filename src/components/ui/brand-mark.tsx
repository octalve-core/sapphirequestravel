import Link from "next/link";
import { Plane } from "lucide-react";
export function BrandMark({inverse=false}:{inverse?:boolean}) {
 return <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Sapphire Quest home">
   <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${inverse?"border-white/25 bg-white/15":"border-[#d4e6ff] bg-[#eef5ff]"}`}><Plane className={`h-5 w-5 -rotate-45 ${inverse?"text-white":"text-sapphire"}`} strokeWidth={1.8}/></span>
   <span className={`flex flex-col leading-[1] tracking-[-.04em] ${inverse?"text-white":"text-navy"}`}><span className="text-xl font-bold">Sapphire <span className="font-medium">Quest</span></span><span className={`mt-1.5 text-[9px] font-medium tracking-[.12em] uppercase ${inverse?"text-white/65":"text-[#446da5]"}`}>Travels &amp; Tours Ltd</span></span>
 </Link>;
}
