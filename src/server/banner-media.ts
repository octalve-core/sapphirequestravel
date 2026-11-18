import "server-only";
import {
  BANNER_ACTIVE_TAG, BANNER_FOLDER, BANNER_OWNER_TAG, BANNER_ROUTE_PREFIX,
  bannerDestinations, bannerRouteTag, type BannerDestination,
  type ManagedBanner, type PublicBanner,
} from "@/features/home/lib/banner-contract";

const BASE = "https://api.imagekit.io/v1/files";
type RawObject = Record<string, unknown>;

export class BannerMediaError extends Error {}

function record(value: unknown): value is RawObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asTags(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && parsed.hostname.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function inBannerFolder(path: unknown): boolean {
  return typeof path === "string" && path.startsWith(BANNER_FOLDER) &&
    path.length > BANNER_FOLDER.length && !path.slice(BANNER_FOLDER.length).includes("/");
}

function fromImageKit(value: unknown): ManagedBanner | null {
  if (!record(value) || !inBannerFolder(value.filePath) || value.fileType !== "image") return null;
  if (value.isPrivateFile === true || value.isPublished === false) return null;
  const url = safeImageUrl(value.url);
  if (!url || typeof value.fileId !== "string") return null;
  const tags = asTags(value.tags);
  if (!tags.includes(BANNER_OWNER_TAG)) return null;
  const match = bannerDestinations.find((item) => tags.includes(bannerRouteTag(item.path)));
  const title = typeof value.description === "string" && value.description.trim().length
    ? value.description.trim().slice(0, 180)
    : "Sapphire Quest travel promotion";
  return {
    fileId: value.fileId,
    imageUrl: url,
    name: typeof value.name === "string" ? value.name : "Promotional banner",
    title,
    href: match?.path ?? "/request",
    published: tags.includes(BANNER_ACTIVE_TAG),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    width: typeof value.width === "number" ? value.width : null,
    height: typeof value.height === "number" ? value.height : null,
  };
}

async function imagekitRequest(path: string, opts: { method?: "GET" | "PATCH"; data?: object; publicCache?: boolean } = {}): Promise<unknown> {
  const key = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!key) throw new BannerMediaError("ImageKit is not configured. Set IMAGEKIT_PRIVATE_KEY in the Sapphire Quest deployment.");
  const options: RequestInit & { next?: { revalidate: number; tags: string[] } } = {
    method: opts.method ?? "GET",
    headers: {
      Authorization: "Basic " + Buffer.from(key + ":").toString("base64"),
      Accept: "application/json",
      ...(opts.data ? { "Content-Type": "application/json" } : {}),
    },
    signal: AbortSignal.timeout(5500),
    ...(opts.publicCache ? { next: { revalidate: 30, tags: ["sapphire-banners"] } } : { cache: "no-store" as const }),
  };
  if (opts.data) options.body = JSON.stringify(opts.data);
  let response: Response;
  try {
    response = await fetch(BASE + path, options);
  } catch {
    throw new BannerMediaError("ImageKit could not be reached. Please retry.");
  }
  if (!response.ok) {
    // Never echo provider response bodies, headers, credentials or tokens.
    throw new BannerMediaError(
      response.status === 401 || response.status === 403
        ? "ImageKit API credentials need media-library read/write access."
        : "ImageKit could not complete this request. Please retry.",
    );
  }
  try { return await response.json() as unknown; }
  catch { throw new BannerMediaError("ImageKit returned an unexpected response."); }
}

export async function listManagedBanners(options: { publicCache?: boolean } = {}): Promise<ManagedBanner[]> {
  const query = new URLSearchParams({
    path: BANNER_FOLDER, type: "file", fileType: "image",
    sort: "DESC_UPDATED", limit: "200",
  });
  const raw = await imagekitRequest("?" + query.toString(), options);
  if (!Array.isArray(raw)) throw new BannerMediaError("ImageKit returned an unexpected media list.");
  return raw.map(fromImageKit).filter((v): v is ManagedBanner => Boolean(v));
}

/** Only one popup is shown; never show draft banners. */
export async function publishedBanner(): Promise<PublicBanner | null> {
  if (!process.env.IMAGEKIT_PRIVATE_KEY) return null;
  try {
    const candidates = await listManagedBanners({ publicCache: true });
    const item = candidates.find((banner) => banner.published);
    return item ? { fileId: item.fileId, imageUrl: item.imageUrl, title: item.title, href: item.href } : null;
  } catch {
    // A temporary ImageKit outage must not stop the homepage rendering.
    return null;
  }
}

async function getBannerDetails(fileId: string): Promise<RawObject> {
  const raw = await imagekitRequest("/" + encodeURIComponent(fileId) + "/details");
  if (!record(raw) || !inBannerFolder(raw.filePath) || raw.fileType !== "image" ||
      !asTags(raw.tags).includes(BANNER_OWNER_TAG)) {
    throw new BannerMediaError("This image is not a Sapphire Quest promotional banner.");
  }
  return raw;
}

async function setTags(fileId: string, tags: string[], description?: string) {
  await imagekitRequest("/" + encodeURIComponent(fileId) + "/details", {
    method: "PATCH", data: { tags, ...(description !== undefined ? { description } : {}) },
  });
}

export async function updateBanner(input: {
  fileId: string;
  action: "save" | "publish" | "unpublish";
  title: string;
  href: BannerDestination;
}): Promise<void> {
  const file = await getBannerDetails(input.fileId);
  if (file.isPublished === false || file.isPrivateFile === true) {
    throw new BannerMediaError("Only public, accessible ImageKit images can be used as campaign banners.");
  }
  const prior = asTags(file.tags);
  const kept = prior.filter((tag) => tag !== BANNER_ACTIVE_TAG && !tag.startsWith(BANNER_ROUTE_PREFIX));
  const nextTags = [...new Set([...kept, BANNER_OWNER_TAG, bannerRouteTag(input.href)])];
  const isActive = prior.includes(BANNER_ACTIVE_TAG);

  if (input.action === "publish") {
    const others = await listManagedBanners();
    // Deactivate the old campaign before publishing a new one. No database migration needed.
    for (const other of others.filter((banner) => banner.published && banner.fileId !== input.fileId)) {
      const old = await getBannerDetails(other.fileId);
      await setTags(other.fileId, asTags(old.tags).filter((tag) => tag !== BANNER_ACTIVE_TAG));
    }
    nextTags.push(BANNER_ACTIVE_TAG);
  } else if (input.action === "save" && isActive) {
    nextTags.push(BANNER_ACTIVE_TAG);
  }
  await setTags(input.fileId, nextTags, input.title.trim());
}
