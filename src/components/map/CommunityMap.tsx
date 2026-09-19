import { useEffect, useMemo, useRef, type ReactNode } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { mapConfig } from "@/config/map";
import type {
  ConcernCluster,
  Coordinates,
  Development,
  Hotspot,
  MapLayerFilter,
  MapSelection,
} from "@/types";
import { classNames } from "@/utils/format";
import { DevelopmentPopup } from "./DevelopmentPopup";
import { HotspotPopup } from "./HotspotPopup";
import { Link } from "react-router-dom";

interface CommunityMapProps {
  developments: Development[];
  hotspots: Hotspot[];
  clusters: ConcernCluster[];
  filter: MapLayerFilter;
  selection: MapSelection | null;
  onSelect: (selection: MapSelection) => void;
}

export function CommunityMap({
  developments,
  hotspots,
  clusters,
  filter,
  selection,
  onSelect,
}: CommunityMapProps) {
  const visibleDevelopments = useMemo(
    () => developments.filter((item) => matchesDevelopmentFilter(item, filter)),
    [developments, filter],
  );
  const visibleClusters = useMemo(
    () =>
      filter === "developments"
        ? []
        : clusters.filter((item) =>
            matchesCategoryFilter(item.category, filter),
          ),
    [clusters, filter],
  );
  const visibleHotspots = useMemo(
    () =>
      filter === "developments"
        ? []
        : hotspots.filter((item) =>
            matchesCategoryFilter(item.category, filter),
          ),
    [hotspots, filter],
  );

  const focus = useMemo(() => {
    if (!selection) return null;
    if (selection.kind === "development") {
      return visibleDevelopments.find((item) => item.id === selection.id)
        ?.coordinates;
    }
    if (selection.kind === "hotspot") {
      return visibleHotspots.find((item) => item.id === selection.id)
        ?.coordinates;
    }
    return visibleClusters.find((item) => item.id === selection.id)?.coordinates;
  }, [selection, visibleDevelopments, visibleHotspots, visibleClusters]);

  return (
    <MapContainer
      center={[mapConfig.center.lat, mapConfig.center.lng]}
      zoom={mapConfig.zoom}
      minZoom={mapConfig.minZoom}
      maxZoom={mapConfig.maxZoom}
      scrollWheelZoom
      zoomControl
      aria-label="Kilimani community map"
    >
      <TileLayer
        url={mapConfig.tiles.url}
        attribution={mapConfig.tiles.attribution}
        {...(mapConfig.tiles.url.includes("{s}")
          ? { subdomains: mapConfig.tiles.subdomains }
          : {})}
      />
      <FlyToPoint target={focus ?? null} />
      <InvalidateSize />
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        maxClusterRadius={48}
        spiderfyOnMaxZoom
        iconCreateFunction={(cluster) => createClusterIcon(cluster, "forest")}
      >
        {visibleDevelopments.map((development) => (
          <SelectableMarker
            key={development.id}
            position={development.coordinates}
            selected={
              selection?.kind === "development" && selection.id === development.id
            }
            icon={markerIcon(
              "development",
              16,
              development.name,
              selection?.kind === "development" && selection.id === development.id,
            )}
            onSelect={() =>
              onSelect({ kind: "development", id: development.id })
            }
          >
            <Popup>
              <DevelopmentPopup development={development} />
            </Popup>
          </SelectableMarker>
        ))}
      </MarkerClusterGroup>
      <MarkerClusterGroup
        chunkedLoading
        showCoverageOnHover={false}
        maxClusterRadius={42}
        spiderfyOnMaxZoom
        iconCreateFunction={(cluster) => createClusterIcon(cluster, "amber")}
      >
        {visibleClusters.map((cluster) => (
          <SelectableMarker
            key={cluster.id}
            position={cluster.coordinates}
            selected={selection?.kind === "cluster" && selection.id === cluster.id}
            icon={markerIcon(
              "concern",
              12 + Math.min(cluster.relatedConcernCount / 3, 8),
              `${cluster.category} cluster`,
              selection?.kind === "cluster" && selection.id === cluster.id,
            )}
            onSelect={() => onSelect({ kind: "cluster", id: cluster.id })}
          >
            <Popup>
              <ClusterPopup cluster={cluster} developments={developments} />
            </Popup>
          </SelectableMarker>
        ))}
      </MarkerClusterGroup>
      {visibleHotspots.map((hotspot) => {
        const size = 18 + Math.min(hotspot.relatedConcernCount, 16);
        return (
          <SelectableMarker
            key={hotspot.id}
            position={hotspot.coordinates}
            selected={selection?.kind === "hotspot" && selection.id === hotspot.id}
            icon={markerIcon(
              "hotspot",
              size,
              hotspot.name,
              selection?.kind === "hotspot" && selection.id === hotspot.id,
            )}
            onSelect={() => onSelect({ kind: "hotspot", id: hotspot.id })}
          >
            <Popup>
              <HotspotPopup hotspot={hotspot} />
            </Popup>
          </SelectableMarker>
        );
      })}
    </MapContainer>
  );
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const timeout = window.setTimeout(() => map.invalidateSize(), 180);
    const onResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

function FlyToPoint({ target }: { target: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(
      [target.lat, target.lng],
      Math.max(map.getZoom(), mapConfig.focusZoom),
      { duration: 0.55 },
    );
  }, [target, map]);
  return null;
}

interface SelectableMarkerProps {
  position: Coordinates;
  selected: boolean;
  icon: L.DivIcon;
  onSelect: () => void;
  children: ReactNode;
}

function SelectableMarker({
  position,
  selected,
  icon,
  onSelect,
  children,
}: SelectableMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!selected) return;
    const timeout = window.setTimeout(() => {
      markerRef.current?.openPopup();
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [selected, icon]);

  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={icon}
      eventHandlers={{ click: onSelect }}
      zIndexOffset={selected ? 600 : 0}
    >
      {children}
    </Marker>
  );
}

function ClusterPopup({
  cluster,
  developments,
}: {
  cluster: ConcernCluster;
  developments: Development[];
}) {
  const development = developments.find(
    (item) => item.id === cluster.developmentId,
  );
  const params = new URLSearchParams({ category: cluster.category });

  return (
    <div className="map-popup">
      <h2>{cluster.category}</h2>
      <p className="map-popup__meta">Aggregated community concern cluster</p>
      <p className="map-popup__stat">
        <strong>{cluster.relatedConcernCount} related concerns</strong>
        {development ? (
          <>
            <br />
            {development.name}
          </>
        ) : null}
        <br />
        {cluster.location}
      </p>
      <div className="btn-row">
        <Link className="btn" to={`/concerns?${params.toString()}`}>
          View concerns
        </Link>
      </div>
    </div>
  );
}

function markerIcon(
  kind: "development" | "concern" | "hotspot",
  size: number,
  label: string,
  selected: boolean,
): L.DivIcon {
  const dimension = Math.round(size);
  return L.divIcon({
    className: classNames(
      "map-marker",
      `map-marker--${kind}`,
      selected && "is-selected",
    ),
    html: `<span class="map-marker__dot" style="width:${dimension}px;height:${dimension}px"></span><span class="visually-hidden">${label}</span>`,
    iconSize: [dimension, dimension],
    iconAnchor: [dimension / 2, dimension / 2],
    popupAnchor: [0, -dimension / 2],
  });
}

function createClusterIcon(
  cluster: { getChildCount: () => number },
  tone: "forest" | "amber",
) {
  const count = cluster.getChildCount();
  const size = count > 8 ? 42 : 36;
  return L.divIcon({
    html: `<span>${count}</span>`,
    className: classNames(
      "jirani-cluster",
      tone === "amber" && "jirani-cluster--amber",
    ),
    iconSize: L.point(size, size),
  });
}

function matchesDevelopmentFilter(
  development: Development,
  filter: MapLayerFilter,
): boolean {
  if (filter === "all" || filter === "developments") return true;
  return development.concernBreakdown.some(
    (item) => item.category === filter && item.count > 0,
  );
}

function matchesCategoryFilter(
  category: string,
  filter: MapLayerFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "developments") return false;
  return category === filter;
}
