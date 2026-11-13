import { Star } from "lucide-react";

export function PackageRating({
  score,
  count,
  source,
}: {
  score?: number | null;
  count?: number;
  source?: string;
}) {
  // Don't imply that unrated new experiences have customer reviews.
  if (score == null || !count || !source || source.trim().length < 12) {
    return <span className="text-[11px] font-medium text-sapphire">Curated experience</span>;
  }
  const rating = Math.max(1, Math.min(5, score));
  return (
    <div aria-label={"Guest rating " + rating.toFixed(1) + " out of 5, from " + count + " verified reviews"} className="flex items-center gap-2">
      <div className="flex items-center gap-0.5 text-[#f59e0b]" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star key={index} size={13} fill={index < Math.round(rating) ? "currentColor" : "none"} strokeWidth={1.8} />
        ))}
      </div>
      <span className="text-xs font-medium text-navy tabular-nums">{rating.toFixed(1)}</span>
      <span className="text-[11px] text-muted">({count} {count === 1 ? "review" : "reviews"})</span>
    </div>
  );
}
