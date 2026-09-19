import type { Coordinates } from "@/types";

const DEFAULT_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const DEFAULT_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS";

export const KILIMANI_CENTER: Coordinates = {
  lat: -1.2921,
  lng: 36.787,
};

export const mapConfig = {
  center: KILIMANI_CENTER,
  zoom: 15,
  minZoom: 13,
  maxZoom: 18,
  focusZoom: 16,
  tiles: {
    url: import.meta.env.VITE_MAP_TILE_URL ?? DEFAULT_TILE_URL,
    attribution:
      import.meta.env.VITE_MAP_TILE_ATTRIBUTION ?? DEFAULT_ATTRIBUTION,
    subdomains: import.meta.env.VITE_MAP_TILE_SUBDOMAINS ?? "abcd",
  },
};
