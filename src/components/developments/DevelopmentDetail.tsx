import { Link } from "react-router-dom";
import type { Development } from "@/types";
import { formatDate, formatNumber } from "@/utils/format";
import { ConcernChart } from "@/components/charts/ConcernChart";

interface DevelopmentDetailProps {
  development: Development;
}

export function DevelopmentDetail({ development }: DevelopmentDetailProps) {
  return (
    <div className="detail-grid">
      <section className="panel">
        <h2 className="panel__title">Development information</h2>
        <dl className="dl">
          <dt>Type</dt>
          <dd>{development.type}</dd>
          <dt>Location</dt>
          <dd>
            {development.location}, Nairobi
          </dd>
          <dt>Stage</dt>
          <dd>{development.stage}</dd>
          <dt>Last updated</dt>
          <dd>{formatDate(development.lastUpdated)}</dd>
          <dt>Participation status</dt>
          <dd>{development.participationStatus}</dd>
        </dl>
        <div className="btn-row">
          <Link className="btn" to={`/map?selected=${development.id}`}>
            View on community map
          </Link>
        </div>
      </section>
      <section className="panel">
        <h2 className="panel__title">Community responses</h2>
        <p className="panel__meta">
          <strong>{formatNumber(development.responseCount)}</strong> aggregated
          responses related to this development
        </p>
        <ConcernChart data={development.concernBreakdown} />
      </section>
      <section className="panel" style={{ gridColumn: "1 / -1" }}>
        <blockquote className="quote">
          <span className="quote__label">AI-generated community summary</span>
          {development.summary}
        </blockquote>
        <p className="panel__meta" style={{ marginTop: "0.8rem", marginBottom: 0 }}>
          This is aggregated community feedback, not an official planning
          determination.
        </p>
      </section>
    </div>
  );
}
