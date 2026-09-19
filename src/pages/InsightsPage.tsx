import { PageHeader } from "@/components/layout/PageHeader";
import { ConcernChart } from "@/components/charts/ConcernChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { InsightCard } from "@/components/insights/InsightCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";
import { formatNumber } from "@/utils/format";

export function InsightsPage() {
  const { status, data, error, retry } = useAsyncData(() =>
    dashboardService.getInsights(),
  );

  if (status === "loading") {
    return (
      <>
        <PageHeader
          kicker="Planning evidence"
          title="Insights"
          support="Emerging patterns drawn from aggregated community feedback."
        />
        <LoadingState label="Loading insights" />
      </>
    );
  }

  if (status === "error" || !data) {
    return <ErrorState message={error ?? undefined} onRetry={retry} />;
  }

  return (
    <>
      <PageHeader
        kicker="Planning evidence"
        title="Insights"
        support="Emerging patterns drawn from aggregated community feedback."
      />
      <section className="metrics-grid">
        <MetricCard
          label="Buildings represented"
          value={formatNumber(data.buildingsRepresented)}
        />
        <MetricCard
          label="Developments represented"
          value={formatNumber(data.developmentsRepresented)}
        />
        <MetricCard
          label="Top category"
          value={data.topCategories[0]?.category ?? "—"}
        />
        <MetricCard
          label="Potential patterns"
          value={formatNumber(data.emergingPatterns.length)}
          accent
        />
      </section>
      <div className="grid-2">
        <section className="panel">
          <h2 className="panel__title">Top concern categories</h2>
          <ConcernChart data={data.topCategories} />
        </section>
        <section className="panel">
          <h2 className="panel__title">Concerns over time</h2>
          <TrendChart data={data.concernsOverTime} />
        </section>
      </div>
      <section className="panel">
        <h2 className="panel__title">Emerging patterns</h2>
        <div className="pattern-list">
          {data.emergingPatterns.map((pattern) => (
            <InsightCard key={pattern.id} pattern={pattern} />
          ))}
        </div>
      </section>
      <section className="panel" style={{ marginTop: "1rem" }}>
        <blockquote className="quote">
          <span className="quote__label">
            Generated from aggregated community feedback
          </span>
          {data.aiInsight}
        </blockquote>
      </section>
    </>
  );
}
