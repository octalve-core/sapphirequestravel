import Image from "next/image";
import Link from "next/link";

/** The actual brand artwork supplied by Sapphire Quest, never reconstructed in CSS. */
export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center focus-visible:rounded-md focus-visible:outline-offset-4"
      aria-label="Sapphire Quest Travels & Tours Ltd — home"
    >
      <Image
        src={inverse ? "/branding/sapphire-quest-on-dark.png" : "/branding/sapphire-quest-on-light.png"}
        alt="Sapphire Quest Travels & Tours Ltd"
        width={inverse ? 2048 : 594}
        height={inverse ? 906 : 264}
        priority={!inverse}
        sizes={inverse ? "(max-width: 640px) 174px, 220px" : "(max-width: 640px) 150px, 194px"}
        className={inverse ? "h-auto w-[174px] object-contain sm:w-[220px]" : "h-auto w-[150px] object-contain sm:w-[194px]"}
      />
    </Link>
  );
}
