import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ExportPdfButton } from "@/components/reports/ExportPdfButton";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";

export function ReportsPage() {
  const { status, data, error, retry } = useAsyncData(() =>
    dashboardService.getReports(),
  );

  if (status === "loading") {
    return (
      <>
        <PageHeader
          kicker="Kilimani, Nairobi"
          title="Reports"
          support="Download a participation report as PDF from the current Kilimani dataset."
        />
        <LoadingState label="Loading reports" />
      </>
    );
  }

  if (status === "error") {
    return <ErrorState message={error ?? undefined} onRetry={retry} />;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No reports yet"
        message="Reports will appear here once participation summaries are generated."
      />
    );
  }

  return (
    <>
      <PageHeader
        kicker="Kilimani, Nairobi"
        title="Reports"
        support="Download a participation report as PDF from the current Kilimani dataset."
      />
      <div className="card-stack">
        {data.map((report) => (
          <article className="report-card" key={report.id}>
            <p className="page-header__kicker">{report.period}</p>
            <h2>{report.title}</h2>
            <p className="panel__meta">{report.summary}</p>
            <ul className="includes">
              {report.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="btn-row">
              <Link className="btn" to={`/reports/${report.id}`}>
                View report
              </Link>
              <ExportPdfButton
                reportId={report.id}
                variant="ghost"
                showStatus
              />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
