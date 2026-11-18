/** ImageKit holds media and campaign settings in tags (no extra Neon migration). */
export const BANNER_FOLDER = "/sapphirequest/banners/";
export const BANNER_OWNER_TAG = "sapphirequest-banner";
export const BANNER_ACTIVE_TAG = "sapphirequest-banner-active";
export const BANNER_ROUTE_PREFIX = "sapphirequest-banner-route-";
export const PAGE_PREFIX = "sq-page-";
export const START_PREFIX = "sq-start-";
export const END_PREFIX = "sq-end-";
export const DELAY_PREFIX = "sq-delay-";

export const bannerDestinations = [
  { path: "/request", label: "Plan your trip", code: "request" },
  { path: "/packages", label: "Explore packages", code: "packages" },
  { path: "/visa-assistance", label: "Visa assistance", code: "visa" },
  { path: "/services", label: "Travel services", code: "services" },
  { path: "/contact", label: "Contact us", code: "contact" },
] as const;
export type BannerDestination = typeof bannerDestinations[number]["path"];
export const bannerRouteTag = (path: BannerDestination): string => {
  const target = bannerDestinations.find((item) => item.path === path);
  return BANNER_ROUTE_PREFIX + (target?.code ?? "request");
};

/** Explicit page allowlist: campaigns can never target admin or API routes. */
export const bannerPages = [
  { path: "/", code: "home", label: "Homepage" },
  { path: "/packages", code: "packages", label: "Packages and package details" },
  { path: "/visa-assistance", code: "visa", label: "Visa assistance" },
  { path: "/services", code: "services", label: "Travel services" },
  { path: "/about", code: "about", label: "About us" },
  { path: "/corporate-travel", code: "corporate", label: "Corporate travel" },
  { path: "/destinations", code: "destinations", label: "Destinations" },
  { path: "/contact", code: "contact", label: "Contact us" },
  { path: "/request", code: "request", label: "Plan your trip / request" },
] as const;
export type BannerPage = typeof bannerPages[number]["path"];
export type BannerSettings = {
  pages: BannerPage[];
  startAt: string | null; // ISO 8601 UTC. Entered in WAT on admin.
  endAt: string | null;
  delaySeconds: number; // 0..30s
};
export const defaultBannerSettings = (): BannerSettings => ({
  pages: ["/"], startAt: null, endAt: null, delaySeconds: 3,
});
export const bannerPageTag = (page: BannerPage) => PAGE_PREFIX + bannerPages.find((item) => item.path === page)!.code;

export function normalizeBannerPage(pathname: string): BannerPage | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  const match = bannerPages.find((page) => page.path === path);
  if (match) return match.path;
  for (const parent of ["/packages", "/destinations"] as const) {
    if (path.startsWith(parent + "/")) return parent;
  }
  return null;
}

function parseTimestamp(tags: string[], prefix: string): string | null {
  const item = tags.find((tag) => tag.startsWith(prefix))?.slice(prefix.length) ?? "";
  if (!/^[0-9a-z]{1,12}$/.test(item)) return null;
  const seconds = Number.parseInt(item, 36);
  const epoch = seconds * 1000;
  if (!Number.isSafeInteger(epoch) || epoch < 1577836800000 || epoch > 4102444800000) return null;
  return new Date(epoch).toISOString();
}
export function readBannerSettings(tags: string[]): BannerSettings {
  const pages = bannerPages
    .filter((page) => tags.includes(bannerPageTag(page.path)))
    .map((page) => page.path);
  const delayRaw = tags.find((tag) => tag.startsWith(DELAY_PREFIX))?.slice(DELAY_PREFIX.length);
  const delay = delayRaw && /^\d{1,2}$/.test(delayRaw) ? Number(delayRaw) : 3;
  return {
    pages: pages.length ? pages : ["/"],
    startAt: parseTimestamp(tags, START_PREFIX),
    endAt: parseTimestamp(tags, END_PREFIX),
    delaySeconds: Number.isInteger(delay) && delay >= 0 && delay <= 30 ? delay : 3,
  };
}
export function bannerSettingsTags(settings: BannerSettings): string[] {
  const tags = settings.pages.map(bannerPageTag);
  if (settings.startAt) tags.push(START_PREFIX + Math.floor(new Date(settings.startAt).getTime() / 1000).toString(36));
  if (settings.endAt) tags.push(END_PREFIX + Math.floor(new Date(settings.endAt).getTime() / 1000).toString(36));
  tags.push(DELAY_PREFIX + String(settings.delaySeconds));
  return tags;
}
export function bannerCanDisplay(settings: BannerSettings, page: BannerPage, now: number): boolean {
  if (!settings.pages.includes(page)) return false;
  if (settings.startAt && now < new Date(settings.startAt).getTime()) return false;
  if (settings.endAt && now >= new Date(settings.endAt).getTime()) return false;
  return true;
}

export type ManagedBanner = {
  fileId: string;
  imageUrl: string;
  name: string;
  title: string;
  href: BannerDestination;
  published: boolean;
  updatedAt: string;
  width: number | null;
  height: number | null;
} & BannerSettings;
export type PublicBanner = Pick<ManagedBanner, "fileId" | "imageUrl" | "title" | "href" | "width" | "height" | "delaySeconds" | "endAt">;
