import { Link } from "react-router-dom";
import type { Hotspot } from "@/types";
import { formatNumber } from "@/utils/format";

interface HotspotPopupProps {
  hotspot: Hotspot;
}

export function HotspotPopup({ hotspot }: HotspotPopupProps) {
  const params = new URLSearchParams({
    category: hotspot.category,
  });

  return (
    <div className="map-popup">
      <h2>{hotspot.name}</h2>
      <p className="map-popup__stat">
        <strong>{formatNumber(hotspot.relatedConcernCount)} related concerns</strong>
        <br />
        {hotspot.buildingCount} buildings
        <br />
        {hotspot.category}
      </p>
      <p className="map-popup__meta" style={{ margin: "0.6rem 0 0.85rem" }}>
        {hotspot.description}
      </p>
      <Link className="btn" to={`/concerns?${params.toString()}`}>
        View concerns
      </Link>
    </div>
  );
}
