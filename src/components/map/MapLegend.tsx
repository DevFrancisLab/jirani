export function MapLegend() {
  return (
    <aside className="map-legend" aria-label="Map legend">
      <ul>
        <li>
          <span className="swatch swatch--forest" aria-hidden="true" />
          Development
        </li>
        <li>
          <span className="swatch swatch--amber" aria-hidden="true" />
          Community concern
        </li>
        <li>
          <span className="swatch swatch--hot" aria-hidden="true" />
          Potential hotspot
        </li>
      </ul>
    </aside>
  );
}
