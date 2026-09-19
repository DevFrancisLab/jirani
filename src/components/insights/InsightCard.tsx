import type { InsightPattern } from "@/types";

interface InsightCardProps {
  pattern: InsightPattern;
}

export function InsightCard({ pattern }: InsightCardProps) {
  return (
    <article className="pattern-card" style={{ cursor: "default" }}>
      <h3>{pattern.title}</h3>
      <p className="pattern-card__stat">
        {pattern.relatedConcernCount} related concerns · {pattern.buildingCount}{" "}
        buildings
      </p>
      <p className="pattern-card__category">{pattern.category}</p>
      <p className="panel__meta" style={{ marginTop: "0.55rem", marginBottom: 0 }}>
        {pattern.description}
      </p>
    </article>
  );
}
