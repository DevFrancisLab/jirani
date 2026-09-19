import type { MapLayerFilter } from "@/types";

const FILTERS: Array<{ id: MapLayerFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "developments", label: "Developments" },
  { id: "Traffic", label: "Traffic" },
  { id: "Water / Sewer", label: "Water / Sewer" },
  { id: "Drainage", label: "Drainage" },
  { id: "Environment", label: "Environment" },
];

interface MapFiltersProps {
  value: MapLayerFilter;
  onChange: (value: MapLayerFilter) => void;
}

export function MapFilters({ value, onChange }: MapFiltersProps) {
  return (
    <div className="map-filters" role="toolbar" aria-label="Map layers">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={value === filter.id ? "is-active" : undefined}
          aria-pressed={value === filter.id}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
