// src/pages/Readings.js
import React, { useMemo, useState } from "react";

const READINGS = [
  {
    title: "Building to Coexist with Fire: Community Risk Reduction Measures for New Development in California",
    authors: "Moritz & Butsic",
    year: 2020,
    source: "UC ANR Publication 8680",
    url: "https://doi.org/10.3733/ucanr.8680",
    topic: "Planning & WUI",
    tags: ["RRMs", "siting", "subdivision"],
    blurb:
      "Concise guidance on subdivision-scale risk reduction measures (siting, layout, density, infrastructure)."
  },
  {
    title: "Berkeleyside’s Guide to Wildfire Season",
    authors: "Kate Rauch & Brian Krans",
    year: 2025,
    source: "Berkeleyside / Cityside",
    url: "/#/berkeley-guide",   // ✅ internal link within your site
    topic: "Community Preparedness",
    tags: ["Berkeley", "Evacuation", "Air Quality", "Defensible Space"],
    blurb:
      "Comprehensive guide to wildfire readiness in the Berkeley Hills — covering evacuation, power outages, air quality, and defensible-space design."
  },
  {
    title: "PAS 594: Planning the Wildland–Urban Interface",
    authors: "American Planning Association",
    year: 2019,
    source: "APA",
    url: "https://planning.org/",
    topic: "Planning & WUI",
    tags: ["zoning", "general plan", "policy"],
    blurb:
      "Planning tools and policy levers for communities at the wildland–urban interface."
  },
  {
    title: "Wildfire Hazard Potential (WHP) v.2020 Data Overview",
    authors: "USFS",
    year: 2020,
    source: "US Forest Service",
    url: "https://www.fs.usda.gov/rds/archive/Catalog/RDS-2015-0047-4",
    topic: "Data & Mapping",
    tags: ["hazard maps", "USFS", "WHP"],
    blurb:
      "National-scale hazard dataset useful for early-stage siting and comparative risk screening."
  },
  {
    title: "California Fire Hazard Severity Zones",
    authors: "CAL FIRE",
    year: 2023,
    source: "CAL FIRE",
    url: "https://osfm.fire.ca.gov/divisions/community-wildfire-preparedness-and-mitigation/wildfire-preparedness/fire-hazard-severity-zones/",
    topic: "Data & Mapping",
    tags: ["FHSZ", "state", "hazard"],
    blurb:
      "Parcel-detailed hazard mapping supporting local adoption in State Responsibility Areas and LRA updates."
  },
  {
    title: "A deep look at plants will guide decisions around preservation, development, habitat restoration and wildfire mitigation",
    authors: "Kate Darby Rauch",
    year: "2022",
    source: "BerkeleySide",
    url: "/#/VegetationAnalysis",   // ✅ internal link within your site
    topic: "Fuels",
    tags: ["Berkeley", "East Bay Hills", "Vegetation", "Defensible Space"],
    blurb:
      "In order to determine the best plan of action for vegetation management, we must take a close look at the species makeup and loading in the East Bay Hills."
  },
  { title: "The Failure of Planning", 
    authors: "Joe R. McBride & Jerry Kent",
    year: "2019",
    source: "International Journal of Wildland Fire",
    topic: "Planning & WUI",
    tags: ["Vegetation", "Home safety", "community"],
    url: "/#/failure-of-planning" }

];

// Optional: define the order of topics/tabs
const TOPICS = [
  "Planning & WUI",
  "Data & Mapping",
  "Policy & Standards",
  "Fire Behavior & Risk",
  "Case Studies"
];

export default function Readings() {
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");

  const topicsWithAll = useMemo(
    () => ["All", ...TOPICS.filter(t => READINGS.some(r => r.topic === t))],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return READINGS.filter((r) => {
      const matchesTopic = activeTopic === "All" || r.topic === activeTopic;
      if (!q) return matchesTopic;
      const hay = [
        r.title,
        r.authors,
        r.source,
        r.topic,
        ...(r.tags || [])
      ]
        .join(" ")
        .toLowerCase();
      return matchesTopic && hay.includes(q);
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [query, activeTopic]);

  return (
    <div className="readings-root doc-ivory" style={{ minHeight: "100vh", background: "#fff" }}>
      <header className="readings-header" style={{ position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.85)", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "16px 20px" }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Readings & References</h1>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Curated articles, datasets, and standards for wildfire-aware planning
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "20px" }}>
        {/* Controls */}
        <div className="controls" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr", marginBottom: 16 }}>
          <div className="tabs" role="tablist" aria-label="Topics" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topicsWithAll.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={activeTopic === t}
                onClick={() => setActiveTopic(t)}
                className={`tab ${activeTopic === t ? "active" : ""}`}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  background: activeTopic === t ? "#0ea5e9" : "#fff",
                  color: activeTopic === t ? "#fff" : "#0f172a",
                  cursor: "pointer"
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <label style={{ display: "block" }}>
            <span className="sr-only">Search readings</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, tag…"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                fontSize: 14
              }}
            />
          </label>
        </div>

        {/* Results */}
        <div aria-live="polite" style={{ marginBottom: 8, color: "#475569", fontSize: 14 }}>
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
          {activeTopic !== "All" ? ` in “${activeTopic}”` : ""}.
        </div>

        <ul className="reading-list" style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
          {filtered.map((r, i) => (
            <li key={`${r.title}-${i}`}>
              <article className="reading-card" style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                transition: "transform 120ms ease"
              }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, lineHeight: 1.3 }}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0ea5e9", textDecoration: "none" }}
                  >
                    {r.title}
                  </a>
                </h3>
                <p style={{ margin: "0 0 6px", color: "#475569", fontSize: 14 }}>
                  <strong>{r.source}</strong>{r.year ? ` · ${r.year}` : ""} — {r.authors}
                </p>
                {r.blurb && (
                  <p style={{ margin: "0 0 8px", color: "#1f2937" }}>{r.blurb}</p>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="chip" style={chipStyle}>{r.topic}</span>
                  {(r.tags || []).map((t) => (
                    <span key={t} className="chip" style={chipStyle}>{t}</span>
                  ))}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>

      <style>{`
        .reading-card:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media print { .readings-header { display: none; } main { padding: 0; } }
      `}</style>
    </div>
  );
}

const chipStyle = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid #e5e7eb",
  fontSize: 12,
  color: "#334155",
  background: "#f8fafc"
};
