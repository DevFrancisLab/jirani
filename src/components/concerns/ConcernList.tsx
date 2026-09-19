import { Link } from "react-router-dom";
import type { Concern, Development } from "@/types";
import { formatDate } from "@/utils/format";

interface ConcernListProps {
  concerns: Concern[];
  developments: Development[];
}

export function ConcernList({ concerns, developments }: ConcernListProps) {
  return (
    <div className="concern-list">
      {concerns.map((concern) => {
        const development = developments.find(
          (item) => item.id === concern.developmentId,
        );
        return (
          <article className="concern-card" key={concern.id}>
            <blockquote className="quote">“{concern.excerpt}”</blockquote>
            <p className="concern-card__meta">
              {concern.category}
              {development ? (
                <>
                  {" · "}
                  <Link
                    className="record-link"
                    to={`/developments/${development.id}`}
                  >
                    {development.name}
                  </Link>
                </>
              ) : null}
              {" · "}
              {concern.location}
              {" · "}
              {formatDate(concern.createdAt)}
              {" · "}
              {concern.status}
            </p>
            <p className="concern-card__meta">
              {concern.relatedConcernCount} related{" "}
              {concern.relatedConcernCount === 1 ? "concern" : "concerns"} ·{" "}
              {concern.buildingCount}{" "}
              {concern.buildingCount === 1 ? "building" : "buildings"}
            </p>
          </article>
        );
      })}
    </div>
  );
}
