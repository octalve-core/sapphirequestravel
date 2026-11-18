"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight, CheckCircle2, ImagePlus, LoaderCircle, RefreshCw,
  RotateCcw, Trash2, UploadCloud,
} from "lucide-react";
import {
  BANNER_FOLDER, BANNER_OWNER_TAG, bannerDestinations, bannerPages, bannerRouteTag,
  bannerSettingsTags, defaultBannerSettings, type BannerDestination, type BannerPage,
  type BannerSettings, type ManagedBanner,
} from "@/features/home/lib/banner-contract";

type JsonError = { error?: string; message?: string };
type UploadAuth = JsonError & { token: string; expire: number; signature: string; publicKey: string };
type UploadResult = JsonError & {
  fileId?: string; filePath?: string; name?: string; url?: string;
  width?: number; height?: number;
};
type BannerAction = "save" | "publish" | "unpublish";

function watTime(iso: string | null) {
  if (!iso) return "";
  const date = new Date(Date.parse(iso) + 60 * 60 * 1000);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 16) : "";
}
function toIso(wat: string): string | null {
  if (!wat) return null;
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(wat)) throw new Error("Enter a valid date and time.");
  const utc = Date.parse(wat + ":00+01:00");
  if (!Number.isFinite(utc) || new Date(utc + 3600000).toISOString().slice(0, 16) !== wat) {
    throw new Error("Enter a valid date and time in Nigeria (WAT).");
  }
  return new Date(utc).toISOString();
}

function BannerCard({
  banner, onUpdated, onReplace, onDelete, replacing,
}: {
  banner: ManagedBanner;
  onUpdated: (id: string, action: BannerAction, title: string, href: BannerDestination, settings: BannerSettings) => void;
  onReplace: (source: ManagedBanner, file: File) => Promise<void>;
  onDelete: (source: ManagedBanner) => Promise<void>;
  replacing: boolean;
}) {
  const [title, setTitle] = useState(banner.title);
  const [href, setHref] = useState<BannerDestination>(banner.href);
  const [pages, setPages] = useState<BannerPage[]>(banner.pages);
  const [start, setStart] = useState(watTime(banner.startAt));
  const [end, setEnd] = useState(watTime(banner.endAt));
  const [delay, setDelay] = useState(banner.delaySeconds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  function settings(): BannerSettings {
    if (!pages.length) throw new Error("Select at least one page for the advert.");
    const startAt = toIso(start);
    const endAt = toIso(end);
    if (startAt && endAt && Date.parse(startAt) >= Date.parse(endAt)) {
      throw new Error("The advert end time must be later than its start time.");
    }
    return { pages, startAt, endAt, delaySeconds: delay };
  }

  async function update(action: BannerAction) {
    if (busy || replacing) return;
    setError("");
    if (title.trim().length < 4 || title.trim().length > 180) {
      setError("Provide an image description between 4 and 180 characters."); return;
    }
    let selection: BannerSettings;
    try { selection = settings(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Invalid schedule."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/banners", {
        method: "PATCH", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: banner.fileId, action, title: title.trim(), href, settings: selection }),
      });
      const payload: JsonError = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to update the banner.");
      onUpdated(banner.fileId, action, title.trim(), href, selection);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update banner.");
    } finally { setBusy(false); }
  }

  async function replace(file: File) {
    setError("");
    try {
      // Carry unsaved changes forward to the new image; original remains live until replacement is published.
      await onReplace({
        ...banner, title: title.trim(), href, ...settings(),
      }, file);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not replace image.");
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  // Server filters the actual campaign schedule at request time.
  const state = banner.published ? "Published · schedule applies" : "Unpublished";

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e2eaf3] bg-white shadow-[0_12px_32px_-25px_rgba(7,28,59,.17)]">
      <div className="relative aspect-video overflow-hidden bg-[#eaf2ff]">
        <Image src={banner.imageUrl} alt={title} fill unoptimized sizes="(max-width: 768px) 100vw, 560px" className="object-contain"/>
        <span className={"absolute bottom-3 left-3 rounded-full px-3 py-1.5 text-[11px] font-medium shadow-sm " +
          (banner.published ? "bg-[#e6f8ef] text-[#136a3e]" : "bg-white text-[#51627e]")}>{state}</span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <label htmlFor={"banner-title-" + banner.fileId} className="block text-[12px] font-medium text-navy">Image description</label>
          <input id={"banner-title-" + banner.fileId} maxLength={180} value={title} onChange={(e) => setTitle(e.target.value)}
            className="input-field mt-2 text-[13px]"/>
          <p className="mt-1 text-[11px] text-muted">Accessible description for visitors who cannot view the artwork.</p>
        </div>
        <div>
          <label htmlFor={"banner-link-" + banner.fileId} className="block text-[12px] font-medium text-navy">When clicked, open</label>
          <select id={"banner-link-" + banner.fileId} value={href} onChange={(e) => setHref(e.target.value as BannerDestination)}
            className="input-field mt-2 text-[13px]">
            {bannerDestinations.map((item) => <option key={item.path} value={item.path}>{item.label}</option>)}
          </select>
        </div>

        <fieldset>
          <legend className="text-[12px] font-medium text-navy">Where should this advert appear?</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {bannerPages.map((page) => (
              <label key={page.path} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-[#e2eaf3] bg-[#f8fbff] px-3 py-2 text-[12px] text-[#28415e]">
                <input type="checkbox" checked={pages.includes(page.path)}
                  onChange={(event) => setPages((current) => event.target.checked
                    ? [...current, page.path] : current.filter((item) => item !== page.path))}
                  className="accent-[#0755db]"/>
                {page.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-[#e2eaf3] bg-[#f8fbff] p-4">
          <legend className="px-2 text-[12px] font-medium text-navy">Schedule and popup timing</legend>
          <p className="text-[11px] leading-5 text-muted">Times are in Nigeria / West Africa Time (UTC+1). Empty dates mean no start or expiry limit.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-[12px] font-medium text-navy">Start date & time (optional)
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)}
                className="input-field mt-2 text-[12px]"/>
            </label>
            <label className="text-[12px] font-medium text-navy">End date & time (optional)
              <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)}
                className="input-field mt-2 text-[12px]"/>
            </label>
            <label className="text-[12px] font-medium text-navy sm:col-span-2">Show popup after
              <select className="input-field mt-2 text-[12px]" value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}>
                {[0, 3, 5, 10, 15, 30].map((seconds) => (
                  <option key={seconds} value={seconds}>{seconds === 0 ? "Immediately" : seconds + " seconds after page load"}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-[11px] text-muted">A visitor sees each banner at most once per browser session. Publishing alone does not override its scheduled dates.</p>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy || replacing} onClick={() => void update("save")}
            className="inline-flex min-h-11 items-center rounded-lg border border-[#d6e1f0] px-4 text-[12px] font-medium text-[#284565] hover:bg-[#f4f8fe] disabled:opacity-60">
            Save changes
          </button>
          <button type="button" disabled={busy || replacing} onClick={() => void update(banner.published ? "unpublish" : "publish")}
            className={"inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-[12px] font-medium text-white disabled:opacity-60 " +
              (banner.published ? "bg-[#475a78] hover:bg-[#394b66]" : "bg-sapphire hover:bg-[#0646b8]")}>
            {busy && <LoaderCircle size={15} className="animate-spin" aria-hidden="true"/>}
            {banner.published ? "Unpublish" : "Publish advert"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[#edf1f6] pt-4">
          <input ref={input} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp"
            aria-label="Choose a replacement image"
            onChange={(event) => { const file = event.target.files?.[0]; if (file) void replace(file); }}/>
          <button type="button" disabled={busy || replacing} onClick={() => input.current?.click()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d6e1f0] px-4 text-[12px] font-medium text-navy hover:bg-[#f5f8fc] disabled:opacity-60">
            {replacing ? <LoaderCircle size={16} className="animate-spin"/> : <RotateCcw size={16}/>}
            Replace image
          </button>
          <button type="button" disabled={busy || replacing} onClick={() => void onDelete(banner)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#f0caca] px-4 text-[12px] font-medium text-red-700 hover:bg-red-50 disabled:opacity-60">
            <Trash2 size={16} aria-hidden="true"/> Delete image
          </button>
        </div>
        <p className="text-[11px] leading-5 text-muted">
          Replacement uploads as a new, unpublished draft with the same settings; publish it when ready, then delete the old file if desired.
          Deleting permanently removes the selected banner from ImageKit.
        </p>
        <p className="truncate text-[11px] text-muted" title={banner.name}>ImageKit: {banner.name}</p>
        {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
      </div>
    </article>
  );
}

function validImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size === 0 || file.size > 5 * 1024 * 1024) {
    throw new Error("Choose a JPG, PNG or WebP image not larger than 5 MB.");
  }
}

export function BannerManager() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [banners, setBanners] = useState<ManagedBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/banners", { credentials: "same-origin", cache: "no-store" });
      const body: JsonError & { banners?: ManagedBanner[] } = await response.json();
      if (!response.ok || !Array.isArray(body.banners)) throw new Error(body.error || "Unable to load banners.");
      setBanners(body.banners);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Banner directory unavailable.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function upload(file: File, source?: ManagedBanner) {
    validImage(file);
    if (uploading) throw new Error("Another upload is in progress.");
    setUploading(true); setBusyId(source?.fileId || "new");
    setError(""); setNotice("");
    try {
      const authResponse = await fetch("/api/admin/media/auth", { credentials: "same-origin", cache: "no-store" });
      const auth: UploadAuth = await authResponse.json();
      if (!authResponse.ok || !auth.signature) throw new Error(auth.error || "ImageKit signing unavailable.");
      const settings: BannerSettings = source ? {
        pages: source.pages, startAt: source.startAt,
        endAt: source.endAt, delaySeconds: source.delaySeconds,
      } : defaultBannerSettings();
      const form = new FormData();
      form.append("file", file);
      form.append("fileName", file.name);
      form.append("publicKey", auth.publicKey);
      form.append("token", auth.token);
      form.append("expire", String(auth.expire));
      form.append("signature", auth.signature);
      form.append("folder", BANNER_FOLDER);
      form.append("useUniqueFileName", "true");
      form.append("tags", JSON.stringify([
        BANNER_OWNER_TAG, bannerRouteTag(source?.href || "/request"),
        ...bannerSettingsTags(settings),
      ]));
      form.append("description", source?.title || "Sapphire Quest travel promotion");
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: form });
      const result: UploadResult = await response.json();
      if (!response.ok || !result.fileId || !result.url || !result.filePath?.startsWith(BANNER_FOLDER)) {
        throw new Error(result.message || result.error || "ImageKit upload failed.");
      }
      const created: ManagedBanner = {
        fileId: result.fileId, imageUrl: result.url, name: result.name || file.name,
        title: source?.title || "Sapphire Quest travel promotion",
        href: source?.href || "/request", published: false,
        updatedAt: new Date().toISOString(),
        width: result.width ?? null, height: result.height ?? null,
        ...settings,
      };
      setBanners((old) => [created, ...old.filter((item) => item.fileId !== created.fileId)]);
      setNotice(source
        ? "Replacement uploaded as an unpublished draft. Publish the new image to replace the live advert; the original is preserved."
        : "Image uploaded as unpublished. Configure its pages and schedule, then publish when ready.");
    } finally {
      setUploading(false); setBusyId("");
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function addFile(file: File) {
    try { await upload(file); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed."); }
  }
  async function replace(source: ManagedBanner, file: File) { await upload(file, source); }

  function onUpdated(id: string, action: BannerAction, title: string, href: BannerDestination, settings: BannerSettings) {
    setBanners((items) => items.map((item) => item.fileId === id ? {
      ...item, title, href, ...settings,
      published: action === "publish" ? true : action === "unpublish" ? false : item.published,
      updatedAt: new Date().toISOString(),
    } : item));
    setNotice(action === "publish" ? "Advert published. It will display on selected pages during its scheduled window."
      : action === "unpublish" ? "Advert unpublished and removed from upcoming popup selections." : "Banner settings saved.");
  }

  async function deleteImage(banner: ManagedBanner) {
    const confirmed = window.confirm(
      "Permanently delete this banner from ImageKit? This cannot be undone. Any active popup using this image will stop displaying."
    );
    if (!confirmed) return;
    setBusyId(banner.fileId); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/banners", {
        method: "DELETE", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: banner.fileId }),
      });
      const body: JsonError = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not delete banner.");
      setBanners((items) => items.filter((item) => item.fileId !== banner.fileId));
      setNotice("Banner deleted from ImageKit. The public campaign cache may take a few moments to refresh.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Banner deletion failed.");
    } finally { setBusyId(""); }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#e1e9f4] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">ImageKit media library</p>
            <h2 className="mt-3 text-[23px] font-medium tracking-[-.035em] text-navy">Upload a promotional banner</h2>
            <p className="mt-3 max-w-2xl text-[13px] leading-7 text-muted">
              Upload artwork, choose public pages, set a Nigeria-time schedule and publish adverts.
              More than one advert can be published; the most recently updated eligible one displays on each page.
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-xl bg-[#ecf3ff] text-sapphire">
            <ImagePlus size={23} aria-hidden="true"/>
          </div>
        </div>
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
          aria-label="Choose a promotional banner image"
          onChange={(event) => { const file = event.target.files?.[0]; if (file) void addFile(file); }}/>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button type="button" disabled={uploading} onClick={() => fileInput.current?.click()}
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-sapphire px-5 text-[13px] font-medium text-white hover:bg-[#0646b8] disabled:opacity-60">
            {uploading ? <LoaderCircle size={17} className="animate-spin"/> : <UploadCloud size={17} aria-hidden="true"/>}
            {uploading ? "Uploading..." : "Upload banner"}
          </button>
          <p className="text-[12px] text-muted">JPG, PNG or WebP · Up to 5 MB · Landscape 16:9 recommended</p>
        </div>
      </section>

      <section aria-label="Uploaded promotional banners">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[21px] font-medium text-navy">Banner library</h2>
            <p className="mt-1 text-[12px] text-muted">An upload is not automatically published. You can save, schedule, replace, unpublish or delete each campaign.</p>
          </div>
          <button type="button" disabled={loading || uploading} onClick={() => void refresh()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#dbe4f0] bg-white px-4 text-[12px] font-medium text-navy hover:bg-[#f5f8fc] disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} aria-hidden="true"/> Refresh
          </button>
        </div>
        {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-800">{error}</p>}
        {notice && <p role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-[#c5e7d4] bg-[#f2faf5] p-4 text-[13px] text-[#1a6c43]"><CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true"/>{notice}</p>}
        {loading ? (
          <p className="rounded-xl border border-[#e2eaf3] bg-white p-8 text-[13px] text-muted">Loading banners...</p>
        ) : banners.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {banners.map((banner) => (
              <BannerCard key={banner.fileId} banner={banner} onUpdated={onUpdated}
                onReplace={replace} onDelete={deleteImage} replacing={busyId === banner.fileId}/>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-[#e2eaf3] bg-white p-8 text-[13px] text-muted">No banners uploaded yet. Upload your first artwork above.</p>
        )}
      </section>
      <p className="flex items-center gap-2 text-[12px] text-muted">
        <ArrowUpRight size={15} aria-hidden="true"/>
        <Link href="/" target="_blank" rel="noopener noreferrer" className="font-medium text-sapphire underline-offset-4 hover:underline">View public homepage</Link>
      </p>
    </div>
  );
}
