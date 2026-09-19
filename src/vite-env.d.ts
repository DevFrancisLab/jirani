/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAP_TILE_URL?: string;
  readonly VITE_MAP_TILE_ATTRIBUTION?: string;
  readonly VITE_MAP_TILE_SUBDOMAINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
