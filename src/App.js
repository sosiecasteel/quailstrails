// src/App.js
import React from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";

import Forecast from "./pages/Forecast";
import MEK from "./pages/MEK";
import Readings from "./pages/Readings";
import MapPage from "./pages/Map"; // your Map.js default export
import BerkeleyGuide from "./pages/BerkeleyGuide";
import VegetationAnalysis from "./pages/VegetationAnalysis";
import FireTimeline from "./pages/FireTimeline";
import AtAGlanceFire from "./pages/AtAGlanceFire";
import FailureOfPlanning from "./pages/FailureOfPlanning";


import "./App.css";
import flamegirl from "./assets/flamegirl.png";
import december from "./assets/decembercalendar.png";
import changeisscary from "./assets/changeisscary.png";


function App() {
    const fireItems = [
      {
        title: "Pack Fire — Eastern Sierra",
        date: "Nov 13",
        location: "Mono County, CA",
        summary:
          "Wind-driven wildfire exploded to several thousand acres. Evacuation orders issued; dozens of structures lost. Monitor Watch Duty for containment updates.",
        badge: "redflag",
        href: "https://www.fire.ca.gov/incidents/2025/11/13/pack-fire",
        meta: "CAL FIRE"
      },
      {
        title: "Statewide Alert — Elevated Fire Risk",
        date: "2025 Season",
        location: "California",
        summary:
          "Over 500,000 acres already burned this season. Dry fuels, drought and occasional wind events keep many regions at high fire danger.",
        badge: "info",
        href: "https://www.fire.ca.gov/incidents",
        meta: "CAL FIRE Archive"
      },
      {
        title: "Be Alert: Holdover Fires & Spot Reactivations",
        date: "Dec 2025",
        location: "CA Hills & Wildland-Urban Edges",
        summary:
          "Fires thought contained are re-igniting in burn scars. If you’re in a vulnerable zone, expect flare-ups especially under wind or dry-lightning conditions.",
        badge: "warning",
        href: "https://www.latimes.com/california/story/2025-12-01/holdover-fires",
        meta: "News"
      },
      {
        title: "Check Live Wildfire Map & Air Quality",
        date: "Today",
        location: "",
        summary:
          "Satellite- and ground-based systems now monitor fire perimeters + smoke. Use tools like Watch Duty or AirNow to check risk near you.",
        badge: "info",
        href: "https://app.watchduty.org",
      }    
  ];
  return (
    <Router>
      <div>
        {/* Top Section with Title and Links */}
        <div className="top-section">
          <Link to="/" className="site-title">DownCountry</Link>
          <div className="nav-links-slim">
            <Link to="/Forecast">Forecast</Link>
            <Link to="/FireTimeline">Timeline</Link>
            <Link to="/MEK">MEK</Link>
            <Link to="/Map">Map</Link>
            <Link to="/Readings">Readings</Link>
          </div>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <div className="main-page">
                <div className="main-content">
                  <img src={flamegirl} alt="flamie" className="flamegirl-image" />
                  <img src={december} alt="dec" className="calendar-image" />
                  <img src={changeisscary} alt="changeis" className="ribbon-image" />

                  <div className="calendar-text-container">
                    <h2>December 2025</h2>
                  </div>

                  <div className="today-container">
                    <h2>Presentation day!</h2>
                  </div>
                </div>
                {/* 🔶 Replace the placeholder header with the live card */}
                <div className="ataglance-container ataglance-wide">
                <AtAGlanceFire items={fireItems} />
              </div>
              </div>
              
            }
          />
          <Route path="/Forecast" element={<Forecast />} />
          <Route path="/FireTimeline" element={<FireTimeline />} />
          <Route path="/MEK" element={<MEK />} />
          <Route path="/Readings" element={<Readings />} />
          <Route path="/Map" element={<MapPage />} />
          <Route path="/berkeley-guide" element={<BerkeleyGuide />} />
          <Route path="/VegetationAnalysis" element={<VegetationAnalysis />} />
          <Route path="/failure-of-planning" element={<FailureOfPlanning />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;

