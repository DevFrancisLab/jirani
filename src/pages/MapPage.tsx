import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { CommunityMap } from "@/components/map/CommunityMap";
import { MapFilters } from "@/components/map/MapFilters";
import { MapLegend } from "@/components/map/MapLegend";
import { MapSidePanel } from "@/components/map/MapSidePanel";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAsyncData } from "@/hooks/useAsyncData";
import { dashboardService } from "@/services/dashboardService";
import type { MapLayerFilter, MapSelection } from "@/types";

const LAYERS: MapLayerFilter[] = [
  "all",
  "developments",
  "Traffic",
  "Water / Sewer",
  "Drainage",
  "Environment",
];

export function MapPage() {
  const [params, setParams] = useSearchParams();
  const layerParam = params.get("layer") ?? params.get("filter") ?? "all";
  const filter: MapLayerFilter = LAYERS.includes(layerParam as MapLayerFilter)
    ? (layerParam as MapLayerFilter)
    : "all";
  const selectedId = params.get("selected");
  const { status, data, error, retry } = useAsyncData(() =>
    dashboardService.getMapData(),
  );

  const selection = useMemo<MapSelection | null>(() => {
    if (!selectedId || !data) return null;
    if (data.developments.some((item) => item.id === selectedId)) {
      return { kind: "development", id: selectedId };
    }
    if (data.hotspots.some((item) => item.id === selectedId)) {
      return { kind: "hotspot", id: selectedId };
    }
    if (data.clusters.some((item) => item.id === selectedId)) {
      return { kind: "cluster", id: selectedId };
    }
    return null;
  }, [selectedId, data]);

  const visibleDevelopments = useMemo(() => {
    if (!data) return [];
    if (filter === "all" || filter === "developments") return data.developments;
    return data.developments.filter((item) =>
      item.concernBreakdown.some(
        (entry) => entry.category === filter && entry.count > 0,
      ),
    );
  }, [data, filter]);

  const visibleHotspots = useMemo(() => {
    if (!data || filter === "developments") return [];
    if (filter === "all") return data.hotspots;
    return data.hotspots.filter((item) => item.category === filter);
  }, [data, filter]);

  const visibleClusters = useMemo(() => {
    if (!data || filter === "developments") return [];
    if (filter === "all") return data.clusters;
    return data.clusters.filter((item) => item.category === filter);
  }, [data, filter]);

  function updateSelection(next: MapSelection) {
    const nextParams = new URLSearchParams(params);
    nextParams.set("selected", next.id);
    setParams(nextParams, { replace: true });
  }

  function updateFilter(next: MapLayerFilter) {
    const nextParams = new URLSearchParams(params);
    nextParams.set("layer", next);
    setParams(nextParams, { replace: true });
  }

  return (
    <div className="map-page">
      <div className="map-toolbar">
        <div>
          <p className="page-header__kicker">Kilimani, Nairobi</p>
          <h1>Community Map</h1>
          <p>Developments, aggregated community concerns, and potential hotspots.</p>
        </div>
        <MapFilters value={filter} onChange={updateFilter} />
      </div>
      {status === "loading" ? (
        <div style={{ padding: "1.2rem" }}>
          <LoadingState label="Loading community map" rows={6} />
        </div>
      ) : status === "error" || !data ? (
        <div style={{ padding: "1.2rem" }}>
          <ErrorState message={error ?? undefined} onRetry={retry} />
        </div>
      ) : (
        <div className="map-canvas-wrap">
          <div className="map-stage">
            <CommunityMap
              developments={data.developments}
              hotspots={data.hotspots}
              clusters={data.clusters}
              filter={filter}
              selection={selection}
              onSelect={updateSelection}
            />
            <MapLegend />
          </div>
          <MapSidePanel
            developments={visibleDevelopments}
            hotspots={visibleHotspots}
            clusters={visibleClusters}
            selection={selection}
            onSelect={updateSelection}
          />
        </div>
      )}
    </div>
  );
}
