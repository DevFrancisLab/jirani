import type { ConcernBreakdown } from "@/types";
import { formatNumber } from "@/utils/format";

interface ConcernChartProps {
  data: ConcernBreakdown[];
  caption?: string;
}

export function ConcernChart({
  data,
  caption = "Community concern categories by response volume",
}: ConcernChartProps) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <figure className="concern-chart">
      <figcaption className="visually-hidden">{caption}</figcaption>
      {data.map((item, index) => (
        <div className="concern-chart__row" key={item.category}>
          <span className="concern-chart__label">{item.category}</span>
          <div
            className="concern-chart__track"
            role="img"
            aria-label={`${item.category}: ${item.count}`}
          >
            <div
              className={
                index === 0
                  ? "concern-chart__bar is-amber"
                  : "concern-chart__bar"
              }
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
          <span className="concern-chart__value">{formatNumber(item.count)}</span>
        </div>
      ))}
    </figure>
  );
}
