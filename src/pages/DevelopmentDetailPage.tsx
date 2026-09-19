import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { DevelopmentDetail } from "@/components/developments/DevelopmentDetail";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";

export function DevelopmentDetailPage() {
  const { id = "" } = useParams();
  const { status, data, error, retry } = useAsyncData(
    () => dashboardService.getDevelopment(id),
    [id],
  );

  if (status === "loading") {
    return <LoadingState label="Loading development" />;
  }

  if (status === "error") {
    return <ErrorState message={error ?? undefined} onRetry={retry} />;
  }

  if (!data) {
    return (
      <EmptyState
        title="Development not found"
        message="This development is not in the current Kilimani dataset."
      />
    );
  }

  return (
    <>
      <p className="page-header__kicker" style={{ marginBottom: "0.7rem" }}>
        <Link className="record-link" to="/developments">
          Developments
        </Link>
      </p>
      <PageHeader
        kicker={`${data.type} development`}
        title={data.name}
        support={`${data.location}, Nairobi · ${data.stage}`}
      />
      <DevelopmentDetail development={data} />
    </>
  );
}
