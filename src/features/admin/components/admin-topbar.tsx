"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ExternalLink, Home, LogOut, Menu, Search, X } from "lucide-react";
import { currentAdminSection, searchScopes } from "@/features/admin/lib/admin-navigation";

type Scope=(typeof searchScopes)[number]["href"];
type Props={
 pathname:string;name:string;role:string;onOpenMenu:()=>void;
 onLogout:()=>void;logoutBusy:boolean;logoutError:string;
};
function initials(name:string):string{
 const parts=name.trim().split(/\s+/).filter(Boolean);
 return (parts.length>1?parts[0][0]+parts[parts.length-1][0]:(parts[0]||"SQ").slice(0,2)).toUpperCase();
}
function HeaderSearch({scope,setScope,id}:{scope:Scope;setScope:(v:Scope)=>void;id:string}){
 return <form method="GET" action={scope} role="search" aria-label="Search staff enquiries"
   className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-[13px] border border-[#dce4ef] bg-[#fbfcfe] p-1.5 shadow-[0_2px_4px_rgba(7,28,59,.035)] focus-within:border-[#a3c4fb]">
   <div className="flex min-w-[165px] flex-1 items-center gap-1">
     <Search size={17} className="ml-2 shrink-0 text-[#6b7e99]" aria-hidden="true"/>
     <label htmlFor={id} className="sr-only">Search enquiries</label>
     <input id={id} name="q" type="search" maxLength={100} autoComplete="off"
       placeholder="Search enquiries, customers, references..."
       className="h-9 min-w-0 flex-1 bg-transparent px-1 text-[12px] font-normal text-navy outline-none placeholder:text-[#8998ad]"/>
   </div>
   <label htmlFor={id+"-scope"} className="sr-only">Search which directory</label>
   <select id={id+"-scope"} value={scope} onChange={event=>setScope(event.target.value as Scope)}
     className="h-9 max-w-[108px] shrink-0 rounded-lg border border-[#e5eaf2] bg-white px-2 text-[11px] font-medium text-[#445b7b] focus-visible:outline-sapphire">
     {searchScopes.map(option=><option key={option.href} value={option.href}>{option.label}</option>)}
   </select>
   <button type="submit" className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-sapphire px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#0349bf]">
     Search
   </button>
 </form>;
}
export function AdminTopbar({pathname,name,role,onOpenMenu,onLogout,logoutBusy,logoutError}:Props){
 const [searchOpen,setSearchOpen]=useState(false);
 const current=currentAdminSection(pathname);
 const [scope,setScope]=useState<Scope>(
   searchScopes.find(item=>pathname===item.href||pathname.startsWith(item.href+"/"))?.href||"/admin/enquiries"
 );
 return <header className="sticky top-0 z-30 border-b border-[#e4e9f1] bg-white/95 backdrop-blur-xl">
   <div className="flex min-h-[74px] min-w-0 items-center justify-between gap-3 px-4 sm:px-6 lg:px-7 xl:px-9">
     <div className="flex min-w-0 items-center gap-3">
       <button type="button" aria-label="Open navigation menu" onClick={onOpenMenu}
         className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#e2e9f3] text-[#24446d] transition-colors hover:bg-[#f1f6ff] lg:hidden">
         <Menu size={20} strokeWidth={1.8} aria-hidden="true"/>
       </button>
       <nav aria-label="Admin breadcrumb" className="flex min-w-0 items-center gap-2 text-[12px]">
         <Link href="/admin" className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-[#6b7f9a] hover:bg-[#f3f7ff] hover:text-sapphire sm:inline-flex" aria-label="Operations overview">
           <Home size={17} strokeWidth={1.8} aria-hidden="true"/>
         </Link>
         <ChevronRight size={14} className="hidden shrink-0 text-[#a7b4c5] sm:block" aria-hidden="true"/>
         {current.isDetail ? <>
           <Link href={current.href} className="max-w-[140px] truncate text-[#5c7090] hover:text-sapphire">{current.label}</Link>
           <ChevronRight size={14} className="shrink-0 text-[#a7b4c5]" aria-hidden="true"/>
           <span aria-current="page" className="truncate font-medium text-[#0b244c]">{current.detail}</span>
         </> : <span aria-current="page" className="truncate text-[13px] font-medium text-[#0b244c]">{current.label}</span>}
       </nav>
     </div>
     <div className="hidden min-w-0 max-w-[480px] flex-1 px-2 xl:block">
       <HeaderSearch id="admin-header-search-desktop" scope={scope} setScope={setScope}/>
     </div>
     <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
       <button type="button" aria-label={searchOpen?"Close search":"Search enquiries"} aria-expanded={searchOpen}
         aria-controls="admin-mobile-search" onClick={()=>setSearchOpen(value=>!value)}
         className="inline-flex size-10 items-center justify-center rounded-xl text-[#40587a] transition-colors hover:bg-[#f2f6fd] xl:hidden">
         {searchOpen?<X size={19}/>:<Search size={19}/>}
       </button>
       <span aria-hidden="true" className="hidden h-7 w-px bg-[#e2e7f0] sm:block"/>
       <details className="group relative">
         <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-[#f5f8fc] [&::-webkit-details-marker]:hidden">
           <span className="hidden max-w-[135px] min-w-0 text-right md:block">
             <span className="block truncate text-[12px] font-medium leading-5 text-navy">{name}</span>
             <span className="block text-[10px] capitalize leading-4 text-[#7587a0]">{role}</span>
           </span>
           <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#092e6e] text-[12px] font-medium tracking-[.02em] text-white ring-[3px] ring-[#edf3ff]">{initials(name)}</span>
           <ChevronDown size={15} className="hidden text-[#7788a1] transition-transform group-open:rotate-180 sm:block" aria-hidden="true"/>
         </summary>
         <div className="absolute right-0 z-40 mt-2 w-[min(85vw,265px)] rounded-2xl border border-[#e2e8f2] bg-white p-2 shadow-[0_22px_55px_rgba(10,33,73,.16)]">
           <div className="border-b border-[#edf1f5] px-3 py-3">
             <p className="break-words text-[12px] font-medium text-navy">{name}</p>
             <p className="mt-1 text-[11px] capitalize text-[#74849a]">{role} · Team workspace</p>
           </div>
           <Link href="/" target="_blank" rel="noopener noreferrer"
             className="mt-1 flex min-h-10 items-center gap-3 rounded-lg px-3 text-[12px] text-[#465b79] hover:bg-[#f1f6fe] hover:text-sapphire">
             <ExternalLink size={16} aria-hidden="true"/> Visit public website
           </Link>
           <button type="button" disabled={logoutBusy} onClick={onLogout}
             className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-[12px] text-[#9b2b34] hover:bg-[#fff2f3] disabled:opacity-60">
             <LogOut size={16} aria-hidden="true"/>{logoutBusy?"Signing out...":"Sign out"}
           </button>
           {logoutError&&<p role="alert" className="px-3 py-2 text-[11px] text-red-700">{logoutError}</p>}
         </div>
       </details>
     </div>
   </div>
   <div id="admin-mobile-search" hidden={!searchOpen} className="border-t border-[#edf0f6] px-4 py-3 sm:px-6 xl:hidden">
     {searchOpen&&<HeaderSearch id="admin-header-search-mobile" scope={scope} setScope={setScope}/>}
   </div>
 </header>;
}
