import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConcernChart } from "@/components/charts/ConcernChart";
import { ExportPdfButton } from "@/components/reports/ExportPdfButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";
import { formatNumber } from "@/utils/format";
import type { OverviewData, Report } from "@/types";

export function ReportDetailPage() {
  const { id = "" } = useParams();
  const { status, data, error, retry } = useAsyncData(
    async (): Promise<{ report: Report | null; overview: OverviewData }> => {
      const [report, overview] = await Promise.all([
        dashboardService.getReport(id),
        dashboardService.getOverview(),
      ]);
      return { report, overview };
    },
    [id],
  );

  if (status === "loading") {
    return <LoadingState label="Loading report" />;
  }
  if (status === "error") {
    return <ErrorState message={error ?? undefined} onRetry={retry} />;
  }
  if (!data?.report) {
    return (
      <EmptyState
        title="Report not found"
        message="This report is not available in the current dataset."
      />
    );
  }

  const report = data.report;
  const overview = data.overview;

  return (
    <>
      <p className="page-header__kicker" style={{ marginBottom: "0.7rem" }}>
        <Link className="record-link" to="/reports">
          Reports
        </Link>
      </p>
      <PageHeader
        kicker={report.area}
        title={report.title}
        support={report.period}
      />
      <section className="metrics-grid">
        <MetricCard
          label="Active developments"
          value={formatNumber(overview.metrics.activeDevelopments)}
        />
        <MetricCard
          label="Community responses"
          value={formatNumber(overview.metrics.communityResponses)}
        />
        <MetricCard
          label="Recurring concerns"
          value={formatNumber(overview.metrics.recurringConcerns)}
        />
        <MetricCard
          label="Potential hotspots"
          value={formatNumber(overview.metrics.potentialHotspots)}
          accent
        />
      </section>
      <section className="panel">
        <h2 className="panel__title">Concern categories</h2>
        <ConcernChart data={overview.concernBreakdown} />
      </section>
      <section className="panel" style={{ marginTop: "1rem" }} id="export">
        <h2 className="panel__title">This report includes</h2>
        <ul className="includes">
          {report.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="btn-row">
          <Link className="btn btn--ghost" to="/map">
            Open community map
          </Link>
          <ExportPdfButton reportId={report.id} />
        </div>
      </section>
    </>
  );
}
