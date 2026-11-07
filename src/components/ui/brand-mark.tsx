import Image from "next/image";
import Link from "next/link";

/** The actual brand artwork supplied by Sapphire Quest, never reconstructed in CSS. */
export function BrandMark({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center focus-visible:rounded-md focus-visible:outline-offset-4 ${compact && !inverse ? "p-2" : ""}`}
      aria-label="Sapphire Quest Travels & Tours Ltd — home"
    >
      <Image
        src={inverse ? "/branding/sapphire-quest-on-dark.png" : "/branding/sapphire-quest-on-light.png"}
        alt="Sapphire Quest Travels & Tours Ltd"
        width={inverse ? 2048 : 594}
        height={inverse ? 906 : 264}
        priority={!inverse}
        sizes={inverse ? "(max-width: 640px) 174px, 220px" : compact ? "(max-width: 640px) 90px, 116px" : "(max-width: 640px) 150px, 194px"}
        className={inverse ? "h-auto w-[174px] object-contain sm:w-[220px]" : compact ? "h-auto w-[90px] object-contain sm:w-[116px]" : "h-auto w-[150px] object-contain sm:w-[194px]"}
      />
    </Link>
  );
}
