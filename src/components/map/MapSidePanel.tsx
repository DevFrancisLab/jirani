import { classNames } from "@/utils/format";
import type { ConcernCluster, Development, Hotspot, MapSelection } from "@/types";

interface MapSidePanelProps {
  developments: Development[];
  hotspots: Hotspot[];
  clusters: ConcernCluster[];
  selection: MapSelection | null;
  onSelect: (selection: MapSelection) => void;
}

export function MapSidePanel({
  developments,
  hotspots,
  clusters,
  selection,
  onSelect,
}: MapSidePanelProps) {
  return (
    <aside className="map-side-panel" aria-label="Map records">
      <h2>Developments</h2>
      {developments.slice(0, 8).map((development) => (
        <button
          key={development.id}
          type="button"
          className={classNames(
            "map-side-item",
            selection?.kind === "development" &&
              selection.id === development.id &&
              "is-selected",
          )}
          onClick={() => onSelect({ kind: "development", id: development.id })}
        >
          <strong>{development.name}</strong>
          <span>
            {development.type} · {development.stage}
          </span>
        </button>
      ))}
      <h2 style={{ marginTop: "0.9rem" }}>Potential hotspots</h2>
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          type="button"
          className={classNames(
            "map-side-item",
            selection?.kind === "hotspot" &&
              selection.id === hotspot.id &&
              "is-selected",
          )}
          onClick={() => onSelect({ kind: "hotspot", id: hotspot.id })}
        >
          <strong>{hotspot.name}</strong>
          <span>
            {hotspot.relatedConcernCount} related concerns · {hotspot.category}
          </span>
        </button>
      ))}
      {clusters.length > 0 ? (
        <>
          <h2 style={{ marginTop: "0.9rem" }}>Concern clusters</h2>
          {clusters.slice(0, 6).map((cluster) => (
            <button
              key={cluster.id}
              type="button"
              className={classNames(
                "map-side-item",
                selection?.kind === "cluster" &&
                  selection.id === cluster.id &&
                  "is-selected",
              )}
              onClick={() => onSelect({ kind: "cluster", id: cluster.id })}
            >
              <strong>{cluster.category}</strong>
              <span>
                {cluster.relatedConcernCount} related concerns · {cluster.location}
              </span>
            </button>
          ))}
        </>
      ) : null}
    </aside>
  );
}
