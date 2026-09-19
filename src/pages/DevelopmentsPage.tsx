import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DevelopmentTable } from "@/components/developments/DevelopmentTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";
import type { DevelopmentStage, DevelopmentType } from "@/types";

const TYPES: Array<DevelopmentType | "all"> = [
  "all",
  "Mixed-use",
  "Residential",
  "Commercial",
];
const STAGES: Array<DevelopmentStage | "all"> = [
  "all",
  "Proposed",
  "Approved",
  "Construction",
  "Completed",
];

export function DevelopmentsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<DevelopmentType | "all">("all");
  const [stage, setStage] = useState<DevelopmentStage | "all">("all");
  const filters = useMemo(() => ({ search, type, stage }), [search, type, stage]);
  const { status, data, error, retry } = useAsyncData(
    () => dashboardService.getDevelopments(filters),
    [filters],
  );

  return (
    <>
      <PageHeader
        kicker="Kilimani, Nairobi"
        title="Developments"
        support="Search and review developments with aggregated community responses."
      />
      <form className="toolbar" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search developments"
          />
        </label>
        <label className="field">
          Development type
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as DevelopmentType | "all")
            }
          >
            {TYPES.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All types" : option}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Stage
          <select
            value={stage}
            onChange={(event) =>
              setStage(event.target.value as DevelopmentStage | "all")
            }
          >
            {STAGES.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All stages" : option}
              </option>
            ))}
          </select>
        </label>
      </form>
      {status === "loading" ? (
        <LoadingState label="Loading developments" />
      ) : status === "error" ? (
        <ErrorState message={error ?? undefined} onRetry={retry} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No developments match your filters"
          message="Try another search term, type, or stage."
        />
      ) : (
        <section className="panel panel--flush">
          <DevelopmentTable
            developments={data}
            columns={[
              "location",
              "type",
              "stage",
              "responses",
              "topConcern",
              "updated",
            ]}
          />
        </section>
      )}
    </>
  );
}
