/** Public promo banners use ImageKit file tags, not a second database. */
export const BANNER_FOLDER = "/sapphirequest/banners/";
export const BANNER_OWNER_TAG = "sapphirequest-banner";
export const BANNER_ACTIVE_TAG = "sapphirequest-banner-active";
export const BANNER_ROUTE_PREFIX = "sapphirequest-banner-route-";

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
};

export type PublicBanner = Pick<ManagedBanner, "fileId" | "imageUrl" | "title" | "href">;
