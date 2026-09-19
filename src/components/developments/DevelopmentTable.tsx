import { Link, useNavigate } from "react-router-dom";
import type { Development } from "@/types";
import { formatDate, formatNumber, topConcern } from "@/utils/format";

interface DevelopmentTableProps {
  developments: Development[];
  selectedId?: string;
  columns?: Array<
    "location" | "type" | "stage" | "responses" | "topConcern" | "updated"
  >;
}

export function DevelopmentTable({
  developments,
  selectedId,
  columns = ["location", "type", "stage", "responses", "topConcern"],
}: DevelopmentTableProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="table-wrap desktop-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Development</th>
              {columns.includes("location") ? <th>Location</th> : null}
              {columns.includes("type") ? <th>Type</th> : null}
              {columns.includes("stage") ? <th>Stage</th> : null}
              {columns.includes("responses") ? (
                <th className="num">Community Responses</th>
              ) : null}
              {columns.includes("topConcern") ? <th>Top Concern</th> : null}
              {columns.includes("updated") ? (
                <th className="col-updated">Last Updated</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {developments.map((development) => (
              <tr
                key={development.id}
                className={selectedId === development.id ? "is-selected" : undefined}
                tabIndex={0}
                onClick={() => navigate(`/developments/${development.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/developments/${development.id}`);
                  }
                }}
              >
                <td>
                  <strong>{development.name}</strong>
                </td>
                {columns.includes("location") ? <td>{development.location}</td> : null}
                {columns.includes("type") ? <td>{development.type}</td> : null}
                {columns.includes("stage") ? <td>{development.stage}</td> : null}
                {columns.includes("responses") ? (
                  <td className="num">{formatNumber(development.responseCount)}</td>
                ) : null}
                {columns.includes("topConcern") ? (
                  <td>{topConcern(development.concernBreakdown)}</td>
                ) : null}
                {columns.includes("updated") ? (
                  <td className="col-updated">
                    {formatDate(development.lastUpdated)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mobile-cards">
        {developments.map((development) => (
          <article key={development.id}>
            <Link className="record-link" to={`/developments/${development.id}`}>
              {development.name}
            </Link>
            <p className="concern-card__meta">
              {development.location} · {development.type} · {development.stage}
            </p>
            <p className="concern-card__meta">
              {formatNumber(development.responseCount)} community responses ·{" "}
              {topConcern(development.concernBreakdown)}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
