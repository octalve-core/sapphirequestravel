export const brand = {
  name: "Sapphire Quest Travels & Tours Ltd",
  shortName: "Sapphire Quest",
  tagline: "Travel, thoughtfully arranged.",
  email: "info@sapphirequesttravel.com",
  phone: "+2349162974349",
  phoneDisplay: "+234 916 297 4349",
  // Retain the existing deployed hostname until the new canonical domain is purchased and verified.
  website: "https://sapphirequestravel.com",
  instagram: "https://instagram.com/sapphirequesttravel",
  socialHandle: "@sapphirequesttravel",
} as const;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Packages", href: "/packages" },
  { label: "Visa assistance", href: "/visa-assistance" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const exploreItems = [
  { label: "Corporate travel", href: "/corporate-travel" },
  { label: "Packages", href: "/packages" },
] as const;
