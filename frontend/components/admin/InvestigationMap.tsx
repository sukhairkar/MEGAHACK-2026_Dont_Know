"use client";

import { useState } from "react";
import styles from "./InvestigationMap.module.css";
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Crosshair } from "lucide-react";
import { type FIRRecord } from "@/lib/data";

interface InvestigationMapProps {
  fir: FIRRecord;
}

export default function InvestigationMap({ fir }: InvestigationMapProps) {
  const [selectedLayer, setSelectedLayer] = useState<string[]>(["incident", "witnesses", "cctv"]);

  const toggleLayer = (layer: string) => {
    setSelectedLayer((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  const layers = [
    { id: "incident", label: "Incident Location", color: "#c53030" },
    { id: "witnesses", label: "Witness Locations", color: "#2b6cb0" },
    { id: "cctv", label: "CCTV Cameras", color: "#2f855a" },
    { id: "poi", label: "Points of Interest", color: "#b7791f" },
  ];

  const markers = [
    {
      id: 1,
      type: "incident",
      label: "Crime Scene",
      lat: fir.lat,
      lng: fir.lng,
      details: fir.location,
    },
    { id: 2, type: "witnesses", label: "Witness 1", lat: fir.lat + 0.002, lng: fir.lng + 0.003, details: "Shop owner" },
    {
      id: 3,
      type: "witnesses",
      label: "Witness 2",
      lat: fir.lat - 0.001,
      lng: fir.lng - 0.002,
      details: "Passerby",
    },
    { id: 4, type: "cctv", label: "Camera 1", lat: fir.lat + 0.001, lng: fir.lng + 0.002, details: "ATM Camera" },
    {
      id: 5,
      type: "cctv",
      label: "Camera 2",
      lat: fir.lat,
      lng: fir.lng - 0.004,
      details: "Shop Security",
    },
    { id: 6, type: "poi", label: "Bank", lat: fir.lat + 0.004, lng: fir.lng + 0.001, details: "Nearby bank branch" },
  ];

  const visibleMarkers = markers.filter((m) => selectedLayer.includes(m.type));

  return (
    <div className={styles.container}>
      <div className={styles.mapHeader}>
        <h2 className={styles.title}>
          <MapPin size={20} />
          Location Analysis
        </h2>
        <div className={styles.coordinates}>
          <Navigation size={14} />
          {fir.lat.toFixed(4)}, {fir.lng.toFixed(4)}
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <div className={styles.mapPlaceholder}>
          {/* Map visualization with markers */}
          <div className={styles.mapGrid}>
            {visibleMarkers.map((marker) => {
              const layer = layers.find((l) => l.id === marker.type);
              const xPos = ((marker.lng - fir.lng) / 0.01) * 30 + 50;
              const yPos = ((fir.lat - marker.lat) / 0.01) * 30 + 50;
              return (
                <div
                  key={marker.id}
                  className={styles.marker}
                  style={{
                    left: `${Math.max(10, Math.min(90, xPos))}%`,
                    top: `${Math.max(10, Math.min(90, yPos))}%`,
                    backgroundColor: layer?.color,
                  }}
                  title={`${marker.label}: ${marker.details}`}
                >
                  <MapPin size={16} />
                  <span className={styles.markerLabel}>{marker.label}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.mapOverlay}>
            <span>Interactive Map View</span>
            <p>Visualizing {visibleMarkers.length} locations based on selected layers</p>
          </div>
        </div>

        <div className={styles.mapControls}>
          <button className={styles.mapControlBtn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button className={styles.mapControlBtn} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button className={styles.mapControlBtn} title="Center on Incident">
            <Crosshair size={18} />
          </button>
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.layersPanel}>
          <h3 className={styles.panelTitle}>
            <Layers size={16} />
            Map Layers
          </h3>
          <div className={styles.layersList}>
            {layers.map((layer) => (
              <label key={layer.id} className={styles.layerItem}>
                <input
                  type="checkbox"
                  checked={selectedLayer.includes(layer.id)}
                  onChange={() => toggleLayer(layer.id)}
                />
                <span
                  className={styles.layerColor}
                  style={{ backgroundColor: layer.color }}
                />
                <span>{layer.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.locationsPanel}>
          <h3 className={styles.panelTitle}>Locations ({visibleMarkers.length})</h3>
          <div className={styles.locationsList}>
            {visibleMarkers.map((marker) => {
              const layer = layers.find((l) => l.id === marker.type);
              return (
                <div key={marker.id} className={styles.locationItem}>
                  <span
                    className={styles.locationDot}
                    style={{ backgroundColor: layer?.color }}
                  />
                  <div className={styles.locationInfo}>
                    <span className={styles.locationName}>{marker.label}</span>
                    <span className={styles.locationDetails}>{marker.details}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.aiInsightsPanel}>
          <h3 className={styles.panelTitle}>AI Location Insights</h3>
          <ul className={styles.insightsList}>
            <li>Crime scene is within 500m of 2 CCTV cameras</li>
            <li>3 potential witnesses identified in the area</li>
            <li>High foot traffic area during incident time</li>
            <li>Nearest police station: 1.2km away</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
