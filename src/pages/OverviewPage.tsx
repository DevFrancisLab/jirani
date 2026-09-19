import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ConcernChart } from "@/components/charts/ConcernChart";
import { DevelopmentTable } from "@/components/developments/DevelopmentTable";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";
import { formatNumber } from "@/utils/format";

const FLOW = [
  "Developments",
  "Participation",
  "Concerns",
  "AI clustering",
  "Spatial patterns",
  "Planning evidence",
];

export function OverviewPage() {
  const { status, data, error, retry } = useAsyncData(() =>
    dashboardService.getOverview(),
  );

  if (status === "loading") {
    return (
      <>
        <PageHeader
          kicker="Kilimani, Nairobi"
          title="Community Overview"
          support="Community participation and development insights"
        />
        <LoadingState label="Loading community overview" />
      </>
    );
  }

  if (status === "error" || !data) {
    return (
      <>
        <PageHeader
          kicker="Kilimani, Nairobi"
          title="Community Overview"
          support="Community participation and development insights"
        />
        <ErrorState message={error ?? undefined} onRetry={retry} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        kicker="Kilimani, Nairobi"
        title="Community Overview"
        support="Community participation and development insights"
      />
      <p className="product-flow" aria-label="Jirani evidence flow">
        {FLOW.map((step, index) => (
          <span key={step}>
            <span className="product-flow__step">{step}</span>
            {index < FLOW.length - 1 ? (
              <span className="product-flow__arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </span>
        ))}
      </p>
      <section className="metrics-grid" aria-label="Participation metrics">
        <MetricCard
          label="Active Developments"
          value={formatNumber(data.metrics.activeDevelopments)}
        />
        <MetricCard
          label="Community Responses"
          value={formatNumber(data.metrics.communityResponses)}
        />
        <MetricCard
          label="Recurring Concerns"
          value={formatNumber(data.metrics.recurringConcerns)}
        />
        <MetricCard
          label="Potential Hotspots"
          value={formatNumber(data.metrics.potentialHotspots)}
          accent
        />
      </section>
      <div className="grid-2">
        <section className="panel">
          <h2 className="panel__title">Community concerns</h2>
          <ConcernChart data={data.concernBreakdown} />
        </section>
        <section className="panel">
          <h2 className="panel__title">Emerging patterns</h2>
          <p className="panel__meta">
            Spatial clusters of related concerns. These are potential patterns,
            not confirmed infrastructure failures.
          </p>
          <div className="pattern-list">
            {data.emergingPatterns.map((pattern) => (
              <Link
                key={pattern.id}
                className="pattern-card"
                to={`/map?selected=${pattern.id}&layer=all`}
              >
                <h3>{pattern.name}</h3>
                <p className="pattern-card__stat">
                  {pattern.relatedConcernCount} related concerns ·{" "}
                  {pattern.buildingCount} buildings
                </p>
                <p className="pattern-card__category">{pattern.category}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <section className="panel panel--flush">
        <div style={{ padding: "1.15rem 1.2rem 0" }}>
          <h2 className="panel__title">Recent developments</h2>
        </div>
        <DevelopmentTable
          developments={data.recentDevelopments}
          columns={["location", "type", "stage", "responses", "topConcern"]}
        />
      </section>
    </>
  );
}
