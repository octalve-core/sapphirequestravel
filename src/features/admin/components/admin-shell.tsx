"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/ui/brand-mark";
import { adminNavigation } from "@/features/admin/lib/admin-navigation";
import { AdminTopbar } from "@/features/admin/components/admin-topbar";

type StaffDisplay={name:string;role:string};

function AdminSidebar({pathname,onNavigate,onLogout,logoutBusy,mobile}:{
 pathname:string;onNavigate:()=>void;onLogout:()=>void;logoutBusy:boolean;mobile?:boolean;
}){
 return <div className="flex h-full min-h-0 flex-col">
   <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-6">
     <div className="min-w-0">
       <BrandMark inverse href="/admin"/>
       <p className="mt-4 px-1 text-[10px] font-medium uppercase tracking-[.18em] text-[#9eb8d9]">Team workspace</p>
     </div>
     {mobile&&<button type="button" onClick={onNavigate} aria-label="Close navigation menu"
       className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10">
       <X size={20} aria-hidden="true"/>
     </button>}
   </div>
   <nav aria-label={mobile?"Mobile admin navigation":"Admin sidebar navigation"}
     className="mt-6 flex-1 space-y-7 overflow-y-auto">
     {adminNavigation.map(section=><div key={section.title}>
       <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[.15em] text-[#829dc2]">{section.title}</p>
       <div className="space-y-1">
         {section.items.map(item=>{
           const Icon=item.icon;
           const active=pathname===item.href||(item.href!=="/admin"&&pathname.startsWith(item.href+"/"));
           return <Link key={item.href} href={item.href} onClick={onNavigate}
             aria-current={pathname===item.href?"page":undefined}
             className={cn("relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-[12px] font-medium transition-colors",
               active?"bg-[#0e57c5] text-white shadow-[0_6px_18px_rgba(0,64,159,.25)]":"text-[#b6c8e0] hover:bg-white/10 hover:text-white")}>
             <Icon size={18} strokeWidth={1.75} className="shrink-0" aria-hidden="true"/>
             <span>{item.label}</span>
           </Link>;
         })}
       </div>
     </div>)}
   </nav>
   <div className="mt-5 space-y-1 border-t border-white/15 pt-5">
     <Link href="/" onClick={onNavigate} target="_blank" rel="noopener noreferrer"
       className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[12px] text-[#b6c8e0] transition-colors hover:bg-white/10 hover:text-white">
       <ExternalLink size={17} aria-hidden="true"/> Public website
     </Link>
     <button type="button" disabled={logoutBusy} onClick={onLogout}
       className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[12px] text-[#b6c8e0] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50">
       <LogOut size={17} aria-hidden="true"/>{logoutBusy?"Signing out...":"Sign out"}
     </button>
   </div>
 </div>;
}

export function AdminShell({children,user}:{children:React.ReactNode;user:StaffDisplay}){
 const pathname=usePathname()||"/admin";
 const router=useRouter();
 const dialogRef=useRef<HTMLDialogElement>(null);
 const [logoutBusy,setLogoutBusy]=useState(false);
 const [logoutError,setLogoutError]=useState("");

 function closeMenu(){dialogRef.current?.close();}
 function openMenu(){
   const el=dialogRef.current;
   if(el&&!el.open)el.showModal();
 }
 useEffect(()=>{
   dialogRef.current?.close();
 },[pathname]);
 useEffect(()=>{
   const media=window.matchMedia("(min-width: 1024px)");
   const closeOnDesktop=()=>{if(media.matches)dialogRef.current?.close();};
   media.addEventListener("change",closeOnDesktop);
   return ()=>media.removeEventListener("change",closeOnDesktop);
 },[]);
 async function logout(){
   if(logoutBusy)return;
   setLogoutBusy(true);
   setLogoutError("");
   try{
     const response=await fetch("/api/auth/logout",{method:"POST",credentials:"same-origin"});
     if(!response.ok)throw new Error("Sign-out failed");
     closeMenu();
     router.replace("/admin/login");
     router.refresh();
   }catch{
     setLogoutError("Unable to sign out. Please try again.");
   }finally{setLogoutBusy(false);}
 }

 return <div className="min-h-dvh bg-[#f5f7fb] lg:flex">
   <aside className="sticky top-0 hidden h-dvh w-[254px] shrink-0 overflow-hidden bg-[#061a36] px-5 py-6 text-white lg:block">
     <AdminSidebar pathname={pathname} onNavigate={closeMenu} onLogout={()=>void logout()} logoutBusy={logoutBusy}/>
   </aside>
   <div className="min-w-0 flex-1">
     <AdminTopbar pathname={pathname} name={user.name} role={user.role}
       onOpenMenu={openMenu} onLogout={()=>void logout()} logoutBusy={logoutBusy} logoutError={logoutError}/>
     <main id="main-content" className="mx-auto max-w-[1580px] px-4 py-7 sm:px-6 sm:py-8 lg:px-7 xl:px-9 xl:py-10">
       {children}
     </main>
   </div>
   <dialog ref={dialogRef} aria-label="Admin navigation"
     className="admin-mobile-drawer fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-white lg:hidden"
     onClick={event=>{if(event.target===event.currentTarget)closeMenu();}}>
     <div className="admin-mobile-panel h-dvh w-[min(86vw,290px)] overflow-y-auto bg-[#061a36] px-5 py-6 shadow-[15px_0_45px_rgba(0,0,0,.2)]">
       <AdminSidebar mobile pathname={pathname} onNavigate={closeMenu}
         onLogout={()=>void logout()} logoutBusy={logoutBusy}/>
       {logoutError&&<p role="alert" className="mt-2 rounded-lg bg-red-900/30 p-2 text-[11px] text-red-100">{logoutError}</p>}
     </div>
   </dialog>
 </div>;
}
