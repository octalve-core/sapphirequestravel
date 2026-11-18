"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, LoaderCircle, Replace, Star, Trash2 } from "lucide-react";

type ImageKitAuth = { token?: string; expire?: number; signature?: string; publicKey?: string; error?: string };
type UploadResponse = { url?: string; message?: string; error?: string };
type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  homeImage?: string;
  onHomeImageChange?: (url: string) => void;
};
type UploadMode = { kind: "add" } | { kind: "replace"; index: number } | { kind: "home" };

export function PackageMedia({ images, onChange, homeImage, onHomeImageChange }: Props) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const selection = useRef<UploadMode>({ kind: "add" });

  function select(mode: UploadMode) {
    if (busy) return;
    setError(""); setNotice("");
    if (mode.kind === "add" && images.length >= 5) {
      setError("The package gallery supports up to five photographs."); return;
    }
    selection.current = mode;
    input.current?.click();
  }

  function addUrl() {
    setError(""); setNotice("");
    if (images.length >= 5) { setError("The package gallery supports up to five photographs."); return; }
    const candidate = url.trim();
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol !== "https:" || !parsed.hostname) throw new Error();
      if (images.includes(candidate)) { setError("This photo is already in the gallery."); return; }
      onChange([...images, candidate]); setUrl("");
      setNotice("Image added to the gallery. Save package changes to publish it.");
    } catch { setError("Enter a valid HTTPS image URL."); }
  }

  async function upload(file: File, mode: UploadMode) {
    setError(""); setNotice("");
    if (mode.kind === "add" && images.length >= 5) { setError("The gallery is full."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 5 * 1024 * 1024) {
      setError("Use a JPG, PNG or WebP image under 5 MB."); return;
    }
    setBusy(true);
    try {
      const authResponse = await fetch("/api/admin/media/auth", { cache: "no-store", credentials: "same-origin" });
      const auth: ImageKitAuth = await authResponse.json();
      if (!authResponse.ok || !auth.signature || !auth.expire || !auth.publicKey || !auth.token) {
        throw new Error(auth.error || "ImageKit upload authorization is not available.");
      }
      const body = new FormData();
      body.append("file", file);
      body.append("fileName", file.name);
      body.append("publicKey", auth.publicKey);
      body.append("token", auth.token);
      body.append("expire", String(auth.expire));
      body.append("signature", auth.signature);
      body.append("folder", "/sapphirequest/packages");
      body.append("useUniqueFileName", "true");
      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body });
      const result: UploadResponse = await response.json();
      if (!response.ok || !result.url) throw new Error(result.message || result.error || "Image upload failed.");

      if (mode.kind === "replace") {
        onChange(images.map((src, i) => i === mode.index ? result.url! : src));
        setNotice("Photo replaced in the editor. Save package changes to update the website.");
      } else if (mode.kind === "home") {
        onHomeImageChange?.(result.url);
        setNotice("Homepage feature image changed in the editor. Save the package to apply it.");
      } else {
        onChange([...images, result.url]);
        setNotice("Photo uploaded. Save package changes to apply it.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to || busy) return;
    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
    setNotice("Gallery order changed. Save package changes to apply it.");
  }
  function remove(index: number) {
    if (busy) return;
    const image = images[index];
    if (!window.confirm("Remove this photo from the package? Save package changes to apply. The original ImageKit file will be preserved.")) return;
    onChange(images.filter((_, i) => i !== index));
    if (homeImage === image) onHomeImageChange?.("");
    setNotice("Photo removed from the package editor. Save changes to remove it from the website.");
  }

  return (
    <div className="space-y-4">
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only"
        aria-label="Upload a package photograph"
        onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, selection.current); }}/>
      {images.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, index) => (
            <div key={src + index} className="overflow-hidden rounded-xl border border-[#dce6f3] bg-[#f8fbff]">
              <div className="relative aspect-[5/3] bg-[#e9eff8]">
                <Image src={src} alt={"Package photo " + (index + 1)} fill unoptimized sizes="(max-width: 640px) 100vw, 320px" className="object-cover"/>
                {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-sapphire shadow-sm">Package cover</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                <button type="button" disabled={busy} onClick={() => select({ kind: "replace", index })}
                  className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#d5e1f1] bg-white px-2 text-[11px] font-medium text-navy disabled:opacity-50">
                  <Replace size={14} aria-hidden="true"/> Replace
                </button>
                <button type="button" disabled={busy} onClick={() => remove(index)}
                  className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#f0d1d1] bg-white px-2 text-[11px] font-medium text-red-700 disabled:opacity-50">
                  <Trash2 size={14} aria-hidden="true"/> Remove
                </button>
                <button type="button" disabled={busy || index === 0} onClick={() => move(index, 0)}
                  className="col-span-2 inline-flex min-h-10 items-center justify-center gap-1 rounded-lg bg-[#edf4ff] px-2 text-[11px] font-medium text-sapphire disabled:opacity-40">
                  <Star size={14} aria-hidden="true"/> Make package cover
                </button>
                <button type="button" disabled={busy || index === 0} onClick={() => move(index, index - 1)}
                  aria-label={"Move photo " + (index + 1) + " left"} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#e0e9f3] bg-white text-navy disabled:opacity-35">
                  <ArrowLeft size={14} aria-hidden="true"/>
                </button>
                <button type="button" disabled={busy || index === images.length - 1} onClick={() => move(index, index + 1)}
                  aria-label={"Move photo " + (index + 1) + " right"} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#e0e9f3] bg-white text-navy disabled:opacity-35">
                  <ArrowRight size={14} aria-hidden="true"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="rounded-xl border border-dashed border-[#cbdcf0] p-5 text-[12px] text-muted">No gallery photographs yet. The official brand emblem will be shown on package cards.</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={busy || images.length >= 5} onClick={() => select({ kind: "add" })}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d6e0ed] px-4 text-[12px] font-medium text-navy disabled:opacity-50">
          {busy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true"/> : <ImagePlus size={16} aria-hidden="true"/>}
          Add gallery image
        </button>
        <span className="text-[11px] text-muted">Maximum 5 gallery images, 5 MB each.</span>
      </div>

      <div className="flex gap-2">
        <input aria-label="External image URL" value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="Or paste an HTTPS image URL" className="input-field min-w-0 flex-1"/>
        <button type="button" disabled={busy || images.length >= 5} onClick={addUrl}
          className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-[#e9f1ff] px-4 text-[12px] font-medium text-sapphire disabled:opacity-50">
          <Link2 size={14} aria-hidden="true"/> Add
        </button>
      </div>

      {onHomeImageChange && (
        <div className="rounded-xl border border-[#d8e5f4] bg-[#f8faff] p-4">
          <p className="text-[12px] font-medium text-navy">Homepage featured card image (optional override)</p>
          <p className="mt-1 text-[11px] leading-5 text-muted">By default the homepage uses your first gallery photo. Set a separate homepage image only when needed.</p>
          {homeImage && (
            <div className="relative mt-3 aspect-[5/3] max-w-[340px] overflow-hidden rounded-xl bg-[#e9eff8]">
              <Image src={homeImage} alt="Homepage featured card" fill unoptimized sizes="340px" className="object-cover"/>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => select({ kind: "home" })}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d6e0ed] bg-white px-4 text-[12px] font-medium text-navy disabled:opacity-50">
              <ImagePlus size={15} aria-hidden="true"/> {homeImage ? "Replace homepage photo" : "Upload homepage photo"}
            </button>
            {homeImage && <button type="button" disabled={busy} onClick={() => onHomeImageChange("")}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#d6e0ed] px-4 text-[12px] font-medium text-navy disabled:opacity-50">Use gallery cover</button>}
          </div>
        </div>
      )}

      {notice && <p role="status" className="text-[12px] text-[#146c43]">{notice}</p>}
      {error && <p role="alert" className="text-[12px] text-red-700">{error}</p>}
      <p className="text-[11px] leading-5 text-muted">
        Changes to package photos take effect after clicking Save package changes. Remove detaches an image from this package,
        but does not permanently delete the underlying ImageKit file, which may be used elsewhere.
      </p>
    </div>
  );
}
