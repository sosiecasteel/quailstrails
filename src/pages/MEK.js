// src/MEK.js
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker } from 'react-leaflet';
import L from 'leaflet';

import tripsData from './trips.json';
import stopsData from './stops.json';

import './MEK.css';

// Helper to color by day of week
function colorForDay(day) {
  const colors = {
    Monday: '#1f77b4',
    Tuesday: '#ff7f0e',
    Wednesday: '#2ca02c',
    Thursday: '#d62728',
    Friday: '#9467bd',
    Saturday: '#8c564b',
    Sunday: '#e377c2',
  };
  return colors[day] || '#333333';
}

// Decide which emoji to use for a given trip
function emojiForTrip(feature) {
  const mode = feature.properties?.mode;
  const desc = (feature.properties?.description || '').toLowerCase();

  // Logging sports segment
  if (desc.includes('logging sports')) return '🪓';

  if (mode === 'run') return '🏃‍♀️';
  if (mode === 'bike') return '🚴‍♀️';

  // Walking to school (CNR) gets nerd emoji
  if (mode === 'walk' && desc.includes('cnr')) return '🤓';

  // Default walk
  return '🚶‍♀️';
}

// Static icons
const homeIcon = L.divIcon({
  className: 'mek-home-icon',
  html: '🏠',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const grizzlyBikeIcon = L.divIcon({
  className: 'mek-avatar-icon',
  html: '🚴‍♀️',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const MEK = () => {
  const [selectedDay, setSelectedDay] = useState('All');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [avatarPath, setAvatarPath] = useState([]); // {lat,lng,emoji,label}

  const days = [
    'All',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Filtered data for the chosen day
  const filteredTripsData =
    selectedDay === 'All'
      ? tripsData
      : {
          ...tripsData,
          features: tripsData.features.filter(
            f => f.properties?.day_of_week === selectedDay
          ),
        };

  const filteredStopsData =
    selectedDay === 'All'
      ? stopsData
      : {
          ...stopsData,
          features: stopsData.features.filter(
            f => f.properties?.day_of_week === selectedDay
          ),
        };

  // Build avatar path through all trips for the selected day,
  // with a label for each step
  useEffect(() => {
    let features;
    if (selectedDay === 'All') {
      features = tripsData.features;
    } else {
      features = tripsData.features.filter(
        f => f.properties?.day_of_week === selectedDay
      );
    }

    const path = [];
    const stepsPerSegment = 20;

    features.forEach(f => {
      const geom = f.geometry;
      if (!geom || geom.type !== 'LineString') return;

      const p = f.properties || {};
      const emoji = emojiForTrip(f);

      const label = [
        p.day_of_week || '',
        p.start_time && p.end_time
          ? `${p.start_time}–${p.end_time}`
          : '',
        p.description || '',
      ]
        .filter(Boolean)
        .join('  •  '); // small separators

      const coords = geom.coordinates; // [lng, lat]

      for (let s = 0; s < coords.length - 1; s++) {
        const [lng1, lat1] = coords[s];
        const [lng2, lat2] = coords[s + 1];

        for (let i = 0; i < stepsPerSegment; i++) {
          const t = i / stepsPerSegment;
          const lat = lat1 + (lat2 - lat1) * t;
          const lng = lng1 + (lng2 - lng1) * t;
          path.push({ lat, lng, emoji, label });
        }
      }
    });

    if (path.length === 0) {
      setAvatarPath([]);
      setAvatarIndex(0);
      return;
    }

    setAvatarPath(path);
    setAvatarIndex(0);
  }, [selectedDay]);

  // Animate avatar along its path
  useEffect(() => {
    if (!avatarPath.length) return;

    const id = setInterval(() => {
      setAvatarIndex(prev => (prev + 1) % avatarPath.length);
    }, 300);

    return () => clearInterval(id);
  }, [avatarPath]);

  const currentStep =
    avatarPath[avatarIndex] || {
      lat: 37.8575,
      lng: -122.2685,
      emoji: '🚶‍♀️',
      label: 'Hanging out at home',
    };

  // Dynamic icon that changes emoji based on what I'm doing
  const avatarIcon = useMemo(
    () =>
      L.divIcon({
        className: 'mek-avatar-icon',
        html: currentStep.emoji,
        iconSize: [50, 50],
        iconAnchor: [25, 50],
      }),
    [currentStep.emoji]
  );

  // Styles + popups
  const tripStyle = feature => {
    const day = feature?.properties?.day_of_week;
    return {
      color: colorForDay(day),
      weight: 3,
      opacity: 0.7,
    };
  };

  const onEachTrip = (feature, layer) => {
    const p = feature.properties || {};
    const html = `
      <strong>Trip</strong><br/>
      <strong>Date:</strong> ${p.date || 'n/a'}<br/>
      <strong>Day:</strong> ${p.day_of_week || 'n/a'}<br/>
      <strong>Mode:</strong> ${p.mode || 'unknown'}<br/>
      <strong>Distance:</strong> ${p.distance_km ? p.distance_km + ' km' : 'n/a'}<br/>
      <strong>Time:</strong> ${p.start_time || '?'} – ${p.end_time || '?'}<br/>
      <strong>Description:</strong> ${p.description || ''}
    `;
    layer.bindPopup(html);
  };

  const stopsPointToLayer = (feature, latlng) => {
    const p = feature.properties || {};

    // Home gets a special house icon instead of a circle
    if (p.category === 'home') {
      return L.marker(latlng, { icon: homeIcon });
    }

    const duration = p.duration_min || 10;
    const radius = Math.max(5, Math.min(20, duration / 20));
    const day = p.day_of_week;

    return L.circleMarker(latlng, {
      radius,
      fillColor: colorForDay(day),
      color: '#333',
      weight: 1,
      opacity: 0.9,
      fillOpacity: 0.8,
    });
  };

  const onEachStop = (feature, layer) => {
    const p = feature.properties || {};
    const html = `
      <strong>${p.name || 'Stop'}</strong><br/>
      <strong>Category:</strong> ${p.category || 'n/a'}<br/>
      <strong>Day:</strong> ${p.day_of_week || 'n/a'}<br/>
      <strong>Duration:</strong> ${p.duration_min ? p.duration_min + ' min' : 'n/a'}
    `;
    layer.bindPopup(html);
  };

  return (
    <div className="mek-page">
      <h1 className="mek-title">A Week in My Life – Movement Map</h1>
      <p className="mek-subtitle">
        Map of my typical week in South Berkeley:
        home → CNR → Sconehenge → Tilden → North Berkeley runs → the Marina →
        logging sports in Lafayette.
      </p>

      {/* Day-of-week buttons */}
      <div className="mek-day-toggle">
        {days.map(day => (
          <button
            key={day}
            className={`mek-day-button ${
              selectedDay === day ? 'active' : ''
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="mek-map-wrapper">
        <MapContainer
          center={[37.87, -122.27]}
          zoom={13}
          style={{ height: '70vh', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          <GeoJSON
            data={filteredTripsData}
            style={tripStyle}
            onEachFeature={onEachTrip}
          />

          <GeoJSON
            data={filteredStopsData}
            pointToLayer={stopsPointToLayer}
            onEachFeature={onEachStop}
          />

          {/* Avatar that changes emoji + label based on what I'm doing */}
          <Marker
            position={[currentStep.lat, currentStep.lng]}
            icon={avatarIcon}
          />

          {/* Bike parked up on Grizzly Peak / Tilden ridge */}
          <Marker
            position={[37.899, -122.238]}
            icon={grizzlyBikeIcon}
          />

          <Marker
            position={[37.862912, -122.263404]} 
            icon={homeIcon}
          />
        </MapContainer>

        {/* Status box showing what I'm doing right now */}
        <div className="mek-status-box">
          <div className="mek-status-title">
            <span className="mek-status-emoji">{currentStep.emoji}</span>
            <span>Right now:</span>
          </div>
          <div className="mek-status-text">
            {currentStep.label}
          </div>
        </div>

        <div className="mek-legend">
          <div className="mek-legend-title">Legend</div>
          <div><strong>Lines</strong> – trips</div>
          <div><strong>Circles</strong> – places I stop</div>
          <div>Circle size – time spent</div>
          <div>Color – day of week</div>
          <div>🏠 – home</div>
          <div>🤓 / 🚶‍♀️ / 🏃‍♀️ / 🚴‍♀️ / 🪓 – what I&apos;m doing right now</div>
          <div>🚴‍♀️ on ridge – bike up on Grizzly Peak</div>
        </div>
      </div>
    </div>
  );
};

export default MEK;
