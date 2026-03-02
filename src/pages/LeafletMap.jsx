// src/pages/LeafletMap.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ScaleControl,
  LayersControl,
  WMSTileLayer,
  useMap,
  Circle,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// === MapTiler / OSM base map ===
const KEY = process.env.REACT_APP_MAPTILER_KEY || "";

const TILE_URL = KEY
  ? `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${KEY}`
  : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATTRIBUTION = KEY
  ? '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

// === LANDFIRE WMS ===
const WMS_URL = "https://edcintl.cr.usgs.gov/geoserver/landfire/us_250/wms";

const LANDFIRE_LAYERS = [
  { id: "LC24_F13_250", label: "FBFM13 – Surface Fuels" },
  { id: "LC24_F40_250", label: "FBFM40 – Detailed Fuels" },
  { id: "LC24_EVT_250", label: "Existing Vegetation Type (EVT)" },
  { id: "LC24_EVC_250", label: "Existing Vegetation Cover (EVC)" },
  { id: "LC24_EVH_250", label: "Existing Vegetation Height (EVH)" },
  { id: "LC24_CC_250", label: "Canopy Cover (CC)" },
  { id: "LC24_CBD_250", label: "Canopy Bulk Density (CBD)" },
  { id: "LC24_CBH_250", label: "Canopy Base Height (CBH)" },
];

// === Mock FlamMap-style ignitions + rings ===
const MOCK_IGNITIONS = [
  {
    id: "A",
    name: "North Ridge ignition",
    position: [37.89, -122.23],
    blurb:
      "A wind-driven ignition along the north ridge above El Cerrito/Richmond, for example from a roadside spark on a hot, dry afternoon.",
  },
  {
    id: "B",
    name: "Claremont Canyon ignition",
    position: [37.86, -122.23],
    blurb:
      "An ignition in upper Claremont Canyon that runs upslope into continuous fuels from a backyard ember or small structure fire.",
  },
  {
    id: "C",
    name: "Tilden ridgeline ignition",
    position: [37.9, -122.24],
    blurb:
      "An ignition along the Tilden ridgeline, such as a lightning strike or equipment spark during dry offshore wind conditions.",
  },
];

// Hypothetical arrival times (minutes)
const TIME_RINGS_MIN = [30, 60, 90];

function ringColor(minutes) {
  if (minutes <= 30) return "#ef4444"; // red
  if (minutes <= 60) return "#f97316"; // orange
  return "#facc15"; // yellow
}

// === Utility: fit map to boundary GeoJSON ===
function FitToGeoJSON({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;
    const layer = L.geoJSON(data);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [data, map]);

  return null;
}

// === Mock FlamMap overlay component ===
function MockFlammapOverlay({ show, activeScenario }) {
  if (!show) return null;

  const ignitionsToShow =
    activeScenario === "all"
      ? MOCK_IGNITIONS
      : MOCK_IGNITIONS.filter((ign) => ign.id === activeScenario);

  return (
    <>
      {/* Debug circle at general Berkeley center */}
      <Circle
        center={[37.8715, -122.2727]}
        radius={2000}
        pathOptions={{
          color: "#22c55e",
          weight: 3,
          dashArray: "6 4",
          fillOpacity: 0,
        }}
      >
        <Tooltip>Debug circle – mock fire perimeter</Tooltip>
      </Circle>

      {/* Ignition markers + concentric rings */}
      {ignitionsToShow.map((ign) => (
        <React.Fragment key={ign.id}>
          <CircleMarker
            center={ign.position}
            radius={6}
            pathOptions={{
              color: "#111827",
              weight: 2,
              fillColor: "#ffffff",
              fillOpacity: 1,
            }}
          >
            <Tooltip sticky>{`Ignition ${ign.id} – ${ign.name}`}</Tooltip>
          </CircleMarker>

          {TIME_RINGS_MIN.map((minutes) => (
            <Circle
              key={minutes}
              center={ign.position}
              radius={minutes * 50} // meters; tweak to look like spread
              pathOptions={{
                color: ringColor(minutes),
                weight: 2,
                dashArray: "4 4",
                fillOpacity: 0,
              }}
            >
              <Tooltip>{`Ignition ${ign.id} – ~${minutes} min perimeter`}</Tooltip>
            </Circle>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

// === Main LeafletMap component ===
export default function LeafletMap() {
  const [geojson, setGeojson] = useState(null);
  const [fuelsOpacity, setFuelsOpacity] = useState(0.75);
  const [activeLayer, setActiveLayer] = useState(LANDFIRE_LAYERS[0].id);
  const [showMockFlammap, setShowMockFlammap] = useState(true);
  const [activeIgnitionScenario, setActiveIgnitionScenario] = useState("all");

  const boundaryStyle = useMemo(
    () => ({ color: "#000", weight: 6, opacity: 0.95, fill: false }),
    []
  );

  // Load EBH boundary from public/data (used only to fit extent)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/data/east-bay-hills.geojson");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setGeojson(data);
      } catch (err) {
        console.error("Failed to load /data/east-bay-hills.geojson:", err);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // LANDFIRE legend URL
  const legendURL = `${WMS_URL}?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image/png&layer=${activeLayer}`;

  const activeIgnitionMeta =
    activeIgnitionScenario === "all"
      ? null
      : MOCK_IGNITIONS.find((ign) => ign.id === activeIgnitionScenario);

  return (
    <div>
      {/* MAP */}
      <div
          style={{
            height: "55vh",
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",      // 👈 add this
          }}
        >
          <MapContainer
            center={[37.8715, -122.2727]}
            zoom={11}
            zoomControl
            style={{ height: "100%", width: "100%" }}
          >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Basemap">
              <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name={`LANDFIRE — ${activeLayer}`}>
              <WMSTileLayer
                key={activeLayer}
                url={WMS_URL}
                layers={activeLayer}
                format="image/png"
                transparent
                version="1.3.0"
                tiled
                styles=""
                opacity={fuelsOpacity}
                crossOrigin
              />
            </LayersControl.Overlay>
          </LayersControl>

          {geojson && (
            // use GeoJSON only to fit extent; remove polygon if you don’t want it visible
            <>
              {/* <GeoJSON data={geojson} style={boundaryStyle} /> */}
              <FitToGeoJSON data={geojson} />
            </>
          )}

          {/* Mock FlamMap-style perimeters */}
          <MockFlammapOverlay
            show={showMockFlammap}
            activeScenario={activeIgnitionScenario}
          />

          <ScaleControl position="bottomleft" />
        </MapContainer>

        {/* LANDFIRE legend overlaid on the map */}
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            background: "#ffffff",
            padding: 8,
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
          }}
        >
          <strong
            style={{
              display: "block",
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            LANDFIRE Legend
          </strong>
          <img
            src={legendURL}
            alt={`Legend for ${activeLayer}`}
            style={{
              display: "block",
              maxHeight: 200,
            }}
          />
        </div>
      </div>

      {/* CONTROLS BELOW MAP */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "flex-start",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {/* Opacity control */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 14, color: "#444" }}>LANDFIRE opacity</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={fuelsOpacity}
            onChange={(e) => setFuelsOpacity(parseFloat(e.target.value))}
          />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {Math.round(fuelsOpacity * 100)}%
          </span>
        </div>

        {/* Toggle mock FlamMap overlay + ignition selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
          <label style={{ fontSize: 14, color: "#444" }}>
            <input
              type="checkbox"
              checked={showMockFlammap}
              onChange={(e) => setShowMockFlammap(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Show FlamMap perimeters
          </label>

          <div>
            <label style={{ fontSize: 14, color: "#444" }}>
              Ignition scenario
            </label>
            <br />
            <select
              value={activeIgnitionScenario}
              onChange={(e) => setActiveIgnitionScenario(e.target.value)}
              style={{
                marginTop: 2,
                padding: "4px 8px",
                fontSize: 14,
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "#fff",
              }}
            >
              <option value="all">Show all ignitions</option>
              <option value="A">Scenario A – North Ridge</option>
              <option value="B">Scenario B – Claremont Canyon</option>
              <option value="C">Scenario C – Tilden ridge</option>
            </select>
          </div>

          {/* Ring legend */}
          <div style={{ fontSize: 11, color: "#4b5563" }}>
            <strong style={{ display: "block", marginBottom: 2 }}>
              Fire spread rings
            </strong>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li>
                <span style={{ color: "#ef4444", fontWeight: 600 }}>Red</span>{" "}
                dashed ring ≈ 30 minutes after ignition
              </li>
              <li>
                <span style={{ color: "#f97316", fontWeight: 600 }}>Orange</span>{" "}
                dashed ring ≈ 60 minutes after ignition
              </li>
              <li>
                <span style={{ color: "#facc15", fontWeight: 600 }}>Yellow</span>{" "}
                dashed ring ≈ 90 minutes after ignition
              </li>
            </ul>
          </div>

          {/* Scenario blurb */}
          <div style={{ fontSize: 11, color: "#4b5563" }}>
            <strong style={{ display: "block", marginBottom: 2 }}>
              Scenario description
            </strong>
            {activeIgnitionMeta ? (
              <p style={{ margin: 0 }}>{activeIgnitionMeta.blurb}</p>
            ) : (
              <p style={{ margin: 0 }}>
                Each ignition point represents a different plausible way a fire
                could start in the East Bay Hills. Use the dropdown to explore
                scenarios individually. These examples are illustrative only,
                not predictive.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
