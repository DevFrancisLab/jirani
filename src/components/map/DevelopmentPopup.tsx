import { Link } from "react-router-dom";
import type { Development } from "@/types";
import { formatNumber } from "@/utils/format";

interface DevelopmentPopupProps {
  development: Development;
}

export function DevelopmentPopup({ development }: DevelopmentPopupProps) {
  return (
    <div className="map-popup">
      <h2>{development.name}</h2>
      <p className="map-popup__meta">
        {development.type}
        <br />
        {development.stage}
        <br />
        {development.location}
      </p>
      <p className="map-popup__stat">
        Community responses
        <br />
        <strong>{formatNumber(development.responseCount)}</strong>
      </p>
      <ul className="breakdown">
        {development.concernBreakdown.map((item) => (
          <li key={item.category}>
            {item.category} — {item.count}
          </li>
        ))}
      </ul>
      <Link className="btn" to={`/developments/${development.id}`}>
        View development
      </Link>
    </div>
  );
}
