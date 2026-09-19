import { classNames } from "@/utils/format";

interface MetricCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

export function MetricCard({ label, value, accent = false }: MetricCardProps) {
  return (
    <article className={classNames("metric-card", accent && "is-accent")}>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
    </article>
  );
}
