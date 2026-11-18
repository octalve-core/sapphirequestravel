import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentStaff, canManage } from "@/server/auth";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { BannerManager } from "@/features/admin/components/banner-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Promotional banners", robots: { index: false, follow: false } };

export default async function PromotionalBanners() {
  const staff = await currentStaff();
  if (!staff) redirect("/admin/login");
  if (!canManage(staff)) redirect("/admin");
  return (
    <AdminShell user={staff}>
      <div className="mb-8">
        <p className="eyebrow">Website marketing</p>
        <h1 className="display-heading mt-3 text-3xl text-navy">Promotional banners</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Manage the travel promotions displayed in the homepage popup. Upload an image, choose where its link should lead and publish or unpublish it without changing the website code.
        </p>
      </div>
      <BannerManager/>
    </AdminShell>
  );
}
