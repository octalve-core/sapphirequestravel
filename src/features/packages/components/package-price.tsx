export function PackagePrice({
  amount,
  currency = "NGN",
  discount = 0,
}: {
  amount: number | null;
  currency?: string;
  discount?: number;
}) {
  if (amount == null || amount <= 0) {
    return <span className="text-sm font-medium text-navy">Personalised pricing</span>;
  }
  const current = Math.round((amount * (100 - discount)) / 100);
  const format = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="text-[11px] font-medium text-muted">From</span>
      <span className="text-[22px] font-medium tracking-[-.03em] text-navy">{format(current)}</span>
      {discount > 0 && (
        <>
          <del className="text-xs text-muted">{format(amount)}</del>
          <span className="rounded-full bg-[#e6f7eb] px-2 py-1 text-[10px] font-medium text-green-700">
            Save {discount}%
          </span>
        </>
      )}
    </div>
  );
}
