import "server-only";
import {
  BANNER_ACTIVE_TAG, BANNER_FOLDER, BANNER_OWNER_TAG, BANNER_ROUTE_PREFIX,
  PAGE_PREFIX, START_PREFIX, END_PREFIX, DELAY_PREFIX,
  bannerDestinations, bannerRouteTag, bannerSettingsTags, bannerCanDisplay,
  readBannerSettings, type BannerDestination, type BannerPage, type BannerSettings,
  type ManagedBanner, type PublicBanner,
} from "@/features/home/lib/banner-contract";

const BASE = "https://api.imagekit.io/v1/files";
type RawObject = Record<string, unknown>;

export class BannerMediaError extends Error {}

function record(value: unknown): value is RawObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function asTags(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === "string") : [];
}
function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname ? value : null;
  } catch { return null; }
}
function inBannerFolder(path: unknown) {
  return typeof path === "string" && path.startsWith(BANNER_FOLDER) &&
    path.length > BANNER_FOLDER.length && !path.slice(BANNER_FOLDER.length).includes("/");
}

/** Tags are optional on upload; the authenticated ImageKit folder + type are authoritative. */
function fromImageKit(value: unknown): ManagedBanner | null {
  if (!record(value) || !inBannerFolder(value.filePath) || value.fileType !== "image") return null;
  if (value.isPrivateFile === true || value.isPublished === false) return null;
  const imageUrl = safeImageUrl(value.url);
  if (!imageUrl || typeof value.fileId !== "string") return null;
  const tags = asTags(value.tags);
  const match = bannerDestinations.find((item) => tags.includes(bannerRouteTag(item.path)));
  const title = typeof value.description === "string" && value.description.trim()
    ? value.description.trim().slice(0, 180) : "Sapphire Quest travel promotion";
  return {
    fileId: value.fileId, imageUrl,
    name: typeof value.name === "string" ? value.name : "Promotional banner",
    title, href: match?.path ?? "/request",
    published: tags.includes(BANNER_ACTIVE_TAG),
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    width: typeof value.width === "number" ? value.width : null,
    height: typeof value.height === "number" ? value.height : null,
    ...readBannerSettings(tags),
  };
}

async function imagekitRequest(
  path: string, options: { method?: "GET" | "PATCH" | "DELETE"; data?: object; publicCache?: boolean } = {},
): Promise<unknown> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) throw new BannerMediaError("ImageKit is not connected. Configure the private API key.");
  const config: RequestInit & { next?: { revalidate: number; tags: string[] } } = {
    method: options.method ?? "GET",
    headers: {
      Authorization: "Basic " + Buffer.from(privateKey + ":").toString("base64"),
      Accept: "application/json",
      ...(options.data ? { "Content-Type": "application/json" } : {}),
    },
    signal: AbortSignal.timeout(7500),
    ...(options.publicCache ? { next: { revalidate: 15, tags: ["sapphire-banners"] } } : { cache: "no-store" as const }),
  };
  if (options.data) config.body = JSON.stringify(options.data);
  let response: Response;
  try { response = await fetch(BASE + path, config); }
  catch { throw new BannerMediaError("ImageKit is temporarily unreachable. Please retry."); }
  if (!response.ok) {
    throw new BannerMediaError(
      response.status === 401 || response.status === 403
        ? "ImageKit media-library read/write access is required."
        : "ImageKit could not complete the request. Please retry.",
    );
  }
  if (options.method === "DELETE" || response.status === 204) return null;
  try { return await response.json() as unknown; }
  catch { throw new BannerMediaError("ImageKit returned an unexpected response."); }
}

export async function listManagedBanners(options: { publicCache?: boolean } = {}): Promise<ManagedBanner[]> {
  const query = new URLSearchParams({
    path: BANNER_FOLDER, type: "file", fileType: "image",
    sort: "DESC_UPDATED", limit: "200",
  });
  const files = await imagekitRequest("?" + query.toString(), options);
  if (!Array.isArray(files)) throw new BannerMediaError("ImageKit returned an invalid media directory.");
  return files.map(fromImageKit).filter((item): item is ManagedBanner => item !== null);
}

/** Multiple campaigns can run on different pages; most recently updated eligible one wins on a page. */
export async function publishedBanner(page: BannerPage): Promise<PublicBanner | null> {
  if (!process.env.IMAGEKIT_PRIVATE_KEY) return null;
  try {
    const now = Date.now();
    const files = await listManagedBanners({ publicCache: true });
    const eligible = files
      .filter((banner) => banner.published && bannerCanDisplay(banner, page, now))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const item = eligible[0];
    return item ? {
      fileId: item.fileId, imageUrl: item.imageUrl, title: item.title, href: item.href,
      width: item.width, height: item.height,
      delaySeconds: item.delaySeconds, endAt: item.endAt,
    } : null;
  } catch {
    // Missing/unreachable ImageKit must never break public pages or booking.
    return null;
  }
}

async function getBannerDetails(fileId: string): Promise<RawObject> {
  const result = await imagekitRequest("/" + encodeURIComponent(fileId) + "/details");
  if (!record(result) || !inBannerFolder(result.filePath) || result.fileType !== "image") {
    throw new BannerMediaError("The selected image is not in the Sapphire Quest banner folder.");
  }
  return result;
}
function keepOtherTags(tags: string[]): string[] {
  return tags.filter((tag) =>
    tag !== BANNER_ACTIVE_TAG && tag !== BANNER_OWNER_TAG &&
    !tag.startsWith(BANNER_ROUTE_PREFIX) && !tag.startsWith(PAGE_PREFIX) &&
    !tag.startsWith(START_PREFIX) && !tag.startsWith(END_PREFIX) &&
    !tag.startsWith(DELAY_PREFIX));
}
async function setTags(fileId: string, tags: string[], description?: string): Promise<void> {
  await imagekitRequest("/" + encodeURIComponent(fileId) + "/details", {
    method: "PATCH", data: { tags, ...(description !== undefined ? { description } : {}) },
  });
}

export async function updateBanner(input: {
  fileId: string;
  action: "save" | "publish" | "unpublish";
  title: string;
  href: BannerDestination;
  settings: BannerSettings;
}): Promise<void> {
  const file = await getBannerDetails(input.fileId);
  if (file.isPublished === false || file.isPrivateFile === true) {
    throw new BannerMediaError("Only publicly accessible ImageKit images can be campaign banners.");
  }
  const oldTags = asTags(file.tags);
  const nextTags = [
    ...keepOtherTags(oldTags), BANNER_OWNER_TAG, bannerRouteTag(input.href),
    ...bannerSettingsTags(input.settings),
  ];
  const published = input.action === "publish" || (
    input.action === "save" && oldTags.includes(BANNER_ACTIVE_TAG)
  );
  if (published) nextTags.push(BANNER_ACTIVE_TAG);
  // Never delete media or edit other campaigns while saving this banner.
  await setTags(input.fileId, [...new Set(nextTags)], input.title.trim());
}

export async function deleteBanner(fileId: string): Promise<void> {
  const file = await getBannerDetails(fileId);
  if (file.isPrivateFile === true) {
    throw new BannerMediaError("Private ImageKit assets cannot be deleted from the public campaign editor.");
  }
  // The authenticated admin must confirm deletion in the UI. Server checks folder before DELETE.
  await imagekitRequest("/" + encodeURIComponent(fileId), { method: "DELETE" });
}
