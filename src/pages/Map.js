// src/pages/Map.js
import LeafletMap from "./LeafletMap";

export default function MapPage() {
  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <header>
        <h1 style={{ margin: 0 }}>East Bay Hills Map</h1>
        <p style={{ margin: "4px 0 0", color: "#555" }}>
          Boundary overlay from <code>/public/data/east-bay-hills.geojson</code>
        </p>
      </header>

      {/* Two maps */}
      <section
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "1fr 1fr"
        }}
      >

        {/* Leaflet */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <h2 style={{ margin: "0 0 8px" }}>Leaflet</h2>
          <LeafletMap />
        </div>
      </section>

      {/* Simple legend */}
      <aside
        style={{
          maxWidth: 520,
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <strong style={{ display: "block", marginBottom: 8 }}>Legend</strong>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span
            style={{
              width: 20,
              height: 12,
              background: "#22c55e",
              opacity: 0.2,
              border: "1px solid #14532d",
              display: "inline-block",
              
            }}
          />
          <span>East Bay Hills boundary</span>
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          Pan/zoom with your mouse or the map controls.
        </div>
      </aside>
    </div>
  );
}
