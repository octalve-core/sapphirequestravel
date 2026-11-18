"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ImagePlus, LoaderCircle, RefreshCw, UploadCloud } from "lucide-react";
import {
  BANNER_FOLDER, BANNER_OWNER_TAG, bannerDestinations, bannerRouteTag,
  type BannerDestination, type ManagedBanner,
} from "@/features/home/lib/banner-contract";

type JsonError = { error?: string };
type UploadAuth = JsonError & { token: string; expire: number; signature: string; publicKey: string };
type UploadResult = JsonError & { message?: string; fileId?: string; filePath?: string; name?: string; url?: string; width?: number; height?: number };
type BannerAction = "save" | "publish" | "unpublish";

function BannerCard({
  banner, onUpdated,
}: {
  banner: ManagedBanner;
  onUpdated: (fileId: string, action: BannerAction, title: string, href: BannerDestination) => void;
}) {
  const [title, setTitle] = useState(banner.title);
  const [href, setHref] = useState<BannerDestination>(banner.href);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function update(action: BannerAction) {
    if (busy) return;
    setError("");
    if (title.trim().length < 4 || title.trim().length > 180) {
      setError("Provide a descriptive image title between 4 and 180 characters.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/banners", {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: banner.fileId, action, title: title.trim(), href }),
      });
      const body: JsonError = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not update banner.");
      onUpdated(banner.fileId, action, title.trim(), href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update banner. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e2eaf3] bg-white shadow-[0_12px_32px_-25px_rgba(7,28,59,.17)]">
      <div className="relative aspect-video overflow-hidden bg-[#eaf2ff]">
        <Image src={banner.imageUrl} alt={title} fill unoptimized sizes="(max-width: 768px) 100vw, 560px" className="object-contain"/>
        <span className={"absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[11px] font-medium shadow-sm " +
          (banner.published ? "bg-[#e6f8ef] text-[#136a3e]" : "bg-white text-[#51627e]")}>
          {banner.published ? "Published on homepage" : "Unpublished"}
        </span>
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <label htmlFor={"banner-title-" + banner.fileId} className="block text-[12px] font-medium text-navy">Image description</label>
          <input id={"banner-title-" + banner.fileId} maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)}
            className="input-field mt-2 text-[13px]" placeholder="Describe the travel promotion"/>
          <p className="mt-1 text-[11px] text-muted">Used for visitors who cannot see the image.</p>
        </div>
        <div>
          <label htmlFor={"banner-cta-" + banner.fileId} className="block text-[12px] font-medium text-navy">When clicked, open</label>
          <select id={"banner-cta-" + banner.fileId} value={href} onChange={(e) => setHref(e.target.value as BannerDestination)}
            className="input-field mt-2 text-[13px]">
            {bannerDestinations.map((item) => <option key={item.path} value={item.path}>{item.label}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={busy} onClick={() => void update("save")}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d6e1f0] px-4 text-[12px] font-medium text-[#284565] hover:bg-[#f4f8fe] disabled:opacity-60">
            Save changes
          </button>
          <button type="button" disabled={busy} onClick={() => void update(banner.published ? "unpublish" : "publish")}
            className={"inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-[12px] font-medium text-white disabled:opacity-60 " +
              (banner.published ? "bg-[#475a78] hover:bg-[#394b66]" : "bg-sapphire hover:bg-[#0646b8]")}>
            {busy && <LoaderCircle size={15} className="animate-spin" aria-hidden="true"/>}
            {banner.published ? "Unpublish" : "Publish banner"}
          </button>
        </div>
        <p className="truncate text-[11px] text-muted" title={banner.name}>ImageKit: {banner.name}</p>
        {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
      </div>
    </article>
  );
}

export function BannerManager() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [banners, setBanners] = useState<ManagedBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/banners", { credentials: "same-origin", cache: "no-store" });
      const body: JsonError & { banners?: ManagedBanner[] } = await response.json();
      if (!response.ok || !Array.isArray(body.banners)) throw new Error(body.error || "Cannot load banners.");
      setBanners(body.banners);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The banner directory could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function upload(file: File) {
    setError("");
    setNotice("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Use a JPG, PNG or WebP image no larger than 5 MB.");
      return;
    }
    setUploading(true);
    try {
      const response = await fetch("/api/admin/media/auth", { credentials: "same-origin", cache: "no-store" });
      const auth: UploadAuth = await response.json();
      if (!response.ok || !auth.signature) throw new Error(auth.error || "ImageKit upload permission is unavailable.");
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("publicKey", auth.publicKey);
      form.append("token", auth.token);
      form.append("expire", String(auth.expire));
      form.append("signature", auth.signature);
      form.append("folder", BANNER_FOLDER);
      form.append("useUniqueFileName", "true");
      form.append("tags", JSON.stringify([BANNER_OWNER_TAG, bannerRouteTag("/request")]));
      form.append("description", "Sapphire Quest travel promotion");
      const result = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: form });
      const uploaded: UploadResult = await result.json();
      if (!result.ok || !uploaded.url || !uploaded.fileId ||
          !uploaded.filePath?.startsWith(BANNER_FOLDER)) {
        throw new Error(uploaded.message || uploaded.error || "ImageKit could not upload this banner.");
      }
      const newBanner: ManagedBanner = {
        fileId: uploaded.fileId,
        imageUrl: uploaded.url,
        name: uploaded.name || file.name,
        title: "Sapphire Quest travel promotion",
        href: "/request",
        published: false,
        updatedAt: new Date().toISOString(),
        width: uploaded.width ?? null,
        height: uploaded.height ?? null,
      };
      setBanners((items) => [newBanner, ...items.filter((item) => item.fileId !== newBanner.fileId)]);
      setNotice("Image uploaded as unpublished. Review its link and select Publish banner when ready.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed. Please retry.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function onUpdated(fileId: string, action: BannerAction, title: string, href: BannerDestination) {
    setBanners((items) => items.map((item) => ({
      ...item,
      ...(item.fileId === fileId ? { title, href } : {}),
      published: action === "publish" ? item.fileId === fileId :
        action === "unpublish" && item.fileId === fileId ? false : item.published,
    })));
    setNotice(action === "publish"
      ? "Banner published. The public popup updates as ImageKit refreshes its media index."
      : action === "unpublish"
        ? "Banner unpublished. It will no longer appear after the public cache refresh."
        : "Banner details saved.");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#e1e9f4] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">ImageKit media library</p>
            <h2 className="mt-3 text-[23px] font-medium tracking-[-.035em] text-navy">Upload a promotional banner</h2>
            <p className="mt-3 max-w-2xl text-[13px] leading-7 text-muted">
              Upload your own Sapphire Quest banner and publish it when ready. Only one banner appears in the homepage popup at a time.
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#ecf3ff] text-sapphire">
            <ImagePlus size={23} aria-hidden="true"/>
          </div>
        </div>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
          aria-label="Choose promotional banner image"
          onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }}/>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button type="button" disabled={uploading} onClick={() => fileInput.current?.click()}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-sapphire px-5 text-[13px] font-medium text-white hover:bg-[#0646b8] disabled:opacity-60">
            {uploading ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true"/> : <UploadCloud size={17} aria-hidden="true"/>}
            {uploading ? "Uploading image..." : "Upload banner"}
          </button>
          <p className="text-[12px] text-muted">JPG, PNG or WebP · Maximum 5 MB · Landscape 16:9 recommended</p>
        </div>
      </section>

      <section aria-label="Uploaded promotional banners">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[21px] font-medium text-navy">Banner library</h2>
            <p className="mt-1 text-[12px] text-muted">Publishing another banner automatically unpublishes the previous campaign.</p>
          </div>
          <button type="button" disabled={loading || uploading} onClick={() => void refresh()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-4 text-[12px] font-medium text-navy hover:bg-[#f5f8fc] disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} aria-hidden="true"/> Refresh
          </button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-[#c5e7d4] bg-[#f2faf5] p-4 text-[13px] text-[#1a6c43]"><CheckCircle2 size={18} aria-hidden="true"/>{notice}</p>}
        {loading ? (
          <p className="rounded-xl border border-[#e2eaf3] bg-white p-8 text-[13px] text-muted">Loading banners...</p>
        ) : banners.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {banners.map((banner) => <BannerCard key={banner.fileId} banner={banner} onUpdated={onUpdated}/>)}
          </div>
        ) : (
          <p className="rounded-xl border border-[#e2eaf3] bg-white p-8 text-[13px] text-muted">No banners uploaded yet. Upload a banner above to start your first campaign.</p>
        )}
      </section>
      <p className="flex items-center gap-2 text-[12px] text-muted">
        <ArrowUpRight size={15} aria-hidden="true"/>
        <Link href="/" target="_blank" rel="noopener noreferrer" className="font-medium text-sapphire underline-offset-4 hover:underline">
          View public homepage
        </Link>
      </p>
    </div>
  );
}
