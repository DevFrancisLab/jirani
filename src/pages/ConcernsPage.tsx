import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConcernList } from "@/components/concerns/ConcernList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";
import type { Concern, ConcernCategory, ConcernStatus, Development } from "@/types";

const CATEGORIES: Array<ConcernCategory | "all"> = [
  "all",
  "Traffic",
  "Water / Sewer",
  "Drainage",
  "Environment",
  "Other",
];
const STATUSES: Array<ConcernStatus | "all"> = [
  "all",
  "Open",
  "Recurring",
  "Aggregated",
];

export function ConcernsPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const categoryParam = params.get("category") ?? "all";
  const category = (CATEGORIES as string[]).includes(categoryParam)
    ? (categoryParam as ConcernCategory | "all")
    : "all";
  const [developmentId, setDevelopmentId] = useState<string>("all");
  const [location, setLocation] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<ConcernStatus | "all">("all");
  const [date, setDate] = useState("all");

  const filters = useMemo(
    () => ({
      search,
      category,
      developmentId,
      location,
      status: statusFilter,
      date,
    }),
    [search, category, developmentId, location, statusFilter, date],
  );

  const { status, data, error, retry } = useAsyncData(
    async (): Promise<{
      items: Concern[];
      developments: Development[];
      locations: string[];
    }> => {
      const [items, developmentList, locationList] = await Promise.all([
        dashboardService.getConcerns(filters),
        dashboardService.getDevelopments(),
        dashboardService.getLocations(),
      ]);
      return { items, developments: developmentList, locations: locationList };
    },
    [filters],
  );

  return (
    <>
      <PageHeader
        kicker="Aggregated community concerns"
        title="Community Concerns"
        support="Anonymized community feedback related to developments in Kilimani. Private resident details are not shown."
      />
      <form className="toolbar" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search excerpts or categories"
          />
        </label>
        <label className="field">
          Category
          <select
            value={filters.category}
            onChange={(event) => {
              const next = event.target.value;
              const nextParams = new URLSearchParams(params);
              if (next === "all") nextParams.delete("category");
              else nextParams.set("category", next);
              setParams(nextParams, { replace: true });
            }}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All categories" : option}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Development
          <select
            value={developmentId}
            onChange={(event) => setDevelopmentId(event.target.value)}
          >
            <option value="all">All developments</option>
            {(data?.developments ?? []).map((development) => (
              <option key={development.id} value={development.id}>
                {development.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Location
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="all">All locations</option>
            {(data?.locations ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Status
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ConcernStatus | "all")
            }
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All statuses" : option}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Date
          <select value={date} onChange={(event) => setDate(event.target.value)}>
            <option value="all">All dates</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
          </select>
        </label>
      </form>
      {status === "loading" ? (
        <LoadingState label="Loading community concerns" />
      ) : status === "error" ? (
        <ErrorState message={error ?? undefined} onRetry={retry} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          title="No community concerns match your filters"
          message="Try another category, development, location, or date."
        />
      ) : (
        <ConcernList concerns={data.items} developments={data.developments} />
      )}
    </>
  );
}
