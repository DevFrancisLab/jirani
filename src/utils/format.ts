export function formatDate(iso: string): string {
  const parts = iso.split("-").map((part) => Number(part));
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  const date =
    year && month && day
      ? new Date(year, month - 1, day)
      : new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function topConcern(
  breakdown: { category: string; count: number }[],
): string {
  if (breakdown.length === 0) return "—";
  return breakdown.reduce((best, current) =>
    current.count > best.count ? current : best,
  ).category;
}

export function classNames(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
