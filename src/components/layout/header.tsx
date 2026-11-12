"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { ButtonLink } from "@/components/ui/button";
import { exploreItems, navItems } from "@/config/brand";

const isCurrent = (pathname: string, href: string) =>
  pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

const navStyle = (active: boolean) =>
  active
    ? "relative whitespace-nowrap text-[12px] font-medium text-sapphire transition-colors 2xl:text-[13px]"
    : "relative whitespace-nowrap text-[12px] font-medium text-[#465469] transition-colors hover:text-sapphire focus-visible:text-sapphire 2xl:text-[13px]";

const mobileLinkStyle = (active: boolean) =>
  active
    ? "flex min-h-12 items-center rounded-xl bg-[#eaf2ff] px-4 text-[15px] font-medium text-sapphire"
    : "flex min-h-12 items-center rounded-xl px-4 text-[15px] font-medium text-[#243853] transition-colors hover:bg-[#f3f6fb] focus-visible:bg-[#f3f6fb]";

export function Header() {
  const pathname = usePathname();
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryItems = navItems.slice(0, 5);
  const contactItem = navItems[5];

  useEffect(() => {
    if (!exploreOpen) return;
    function outside(event: PointerEvent) {
      if (!exploreRef.current?.contains(event.target as Node)) setExploreOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExploreOpen(false);
        exploreButtonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [exploreOpen]);

  useEffect(() => {
    // App Router can preserve client layout state while the page changes.
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);

  useEffect(() => {
    // Prevent a hidden modal from trapping the page after desktop resizing.
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onResize = () => {
      if (desktop.matches && dialogRef.current?.open) dialogRef.current.close();
    };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  function openMobile() {
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    setMobileOpen(true);
  }

  function closeMobile() {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    const panel = panelRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!panel || reduceMotion) {
      dialog.close();
      return;
    }
    const exit = panel.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
      { duration: 220, easing: "cubic-bezier(.4,0,1,1)" },
    );
    void exit.finished.then(() => {
      if (dialog.open) dialog.close();
    }).catch(() => {
      if (dialog.open) dialog.close();
    });
  }

  function closeOnNavigate() {
    setExploreOpen(false);
    closeMobile();
  }

  return (
    <header className="sticky top-0 z-[70] border-b border-[#e9edf3] bg-white/95 shadow-[0_4px_24px_rgba(6,24,53,.055)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/90">
      <div className="container-wide flex h-[76px] items-center justify-between gap-4 sm:h-[84px]">
        <BrandMark compact />

        <nav aria-label="Main navigation" className="hidden items-center gap-4 xl:flex 2xl:gap-6">
          {primaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
              className={navStyle(isCurrent(pathname, item.href))}
              onClick={() => setExploreOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <div className="relative" ref={exploreRef}>
            <button
              ref={exploreButtonRef}
              type="button"
              aria-controls={exploreOpen ? "sapphire-explore-dropdown" : undefined}
              aria-expanded={exploreOpen}
              onClick={() => setExploreOpen((value) => !value)}
              className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-[12px] font-medium text-[#465469] transition-colors hover:text-sapphire 2xl:text-[13px]"
            >
              Explore
              <ChevronDown size={14} aria-hidden="true" className={exploreOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
            {exploreOpen && (
              <div
                id="sapphire-explore-dropdown"
                className="absolute left-1/2 top-full mt-2 w-[232px] -translate-x-1/2 rounded-2xl border border-[#e5eaf2] bg-white p-2 shadow-[0_24px_55px_rgba(9,23,53,.16)]"
              >
                {exploreItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setExploreOpen(false)}
                    aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                    className="flex min-h-11 items-center justify-between rounded-xl px-3 text-[13px] font-medium text-[#253956] transition-colors hover:bg-[#f1f6ff] hover:text-sapphire focus-visible:bg-[#f1f6ff]"
                  >
                    {item.label}
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href={contactItem.href}
            aria-current={isCurrent(pathname, contactItem.href) ? "page" : undefined}
            className={navStyle(isCurrent(pathname, contactItem.href))}
            onClick={() => setExploreOpen(false)}
          >
            {contactItem.label}
          </Link>
        </nav>

        <div className="hidden xl:flex">
          <ButtonLink href="/request" className="min-h-11 whitespace-nowrap px-4 text-[12px] 2xl:px-5 2xl:text-[13px]">
            Plan your trip <ArrowUpRight size={15} />
          </ButtonLink>
        </div>

        <button
          type="button"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
          onClick={openMobile}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-[#e5eaf2] text-navy transition-colors hover:bg-[#f3f6fb] xl:hidden"
        >
          <Menu size={23} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="sapphire-mobile-menu-title"
        onClose={() => { setMobileOpen(false); setMobileExploreOpen(false); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeMobile(); }}
        className="mobile-nav-dialog xl:hidden"
      >
        <div ref={panelRef} className="mobile-nav-panel ml-auto flex h-full w-[min(90vw,400px)] flex-col bg-white shadow-[-16px_0_75px_rgba(0,0,0,.22)]">
          <div className="flex min-h-[82px] items-center justify-between border-b border-[#e9edf3] px-6">
            <div>
              <p id="sapphire-mobile-menu-title" className="text-[15px] font-medium tracking-[-.02em] text-navy">Sapphire Quest</p>
              <p className="mt-1 text-[11px] text-muted">Navigation</p>
            </div>
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close navigation menu"
              className="flex size-11 items-center justify-center rounded-xl border border-[#e5eaf2] text-navy hover:bg-[#f3f6fb]"
            >
              <X aria-hidden="true" size={22} />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6">
            <div className="space-y-1">
              {primaryItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeOnNavigate}
                  aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                  className={mobileLinkStyle(isCurrent(pathname, item.href))}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                aria-controls={mobileExploreOpen ? "sapphire-mobile-explore" : undefined}
                aria-expanded={mobileExploreOpen}
                onClick={() => setMobileExploreOpen((value) => !value)}
                className="flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left text-[15px] font-medium text-[#243853] hover:bg-[#f3f6fb]"
              >
                Explore
                <ChevronDown size={17} aria-hidden="true" className={mobileExploreOpen ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              {mobileExploreOpen && (
                <div id="sapphire-mobile-explore" className="ml-4 space-y-1 border-l-2 border-[#dce9fb] pl-3">
                  {exploreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeOnNavigate}
                      aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                      className={mobileLinkStyle(isCurrent(pathname, item.href))}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href={contactItem.href}
                onClick={closeOnNavigate}
                aria-current={isCurrent(pathname, contactItem.href) ? "page" : undefined}
                className={mobileLinkStyle(isCurrent(pathname, contactItem.href))}
              >
                {contactItem.label}
              </Link>
            </div>
          </nav>

          <div className="border-t border-[#e9edf3] bg-[#f8faff] px-6 py-6">
            <Link
              href="/request"
              onClick={closeOnNavigate}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-sapphire px-5 text-sm font-medium text-white transition-colors hover:bg-[#0647b8]"
            >
              Plan your trip <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <p className="mt-4 text-center text-[11px] text-[#71819a]">Travel, thoughtfully arranged.</p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
