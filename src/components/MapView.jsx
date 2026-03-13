"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom red icon for Crime Scene
const CrimeSceneIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

import "leaflet.heat";

// Heatmap Layer Component
function HeatmapLayer({ points = [] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    // Convert points to [lat, lng, intensity]
    const heatPoints = points.map(p => [p.lat, p.lng, p.intensity]);
    const heatLayer = L.heatLayer(heatPoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Map Legend Component
const Legend = () => {
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl flex flex-col gap-2 min-w-[150px]">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 border-b border-white/5 pb-1">
        Intelligence Legend
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-white/20"></div>
        <span className="text-[10px] text-slate-300 font-semibold">Crime Scene</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] border border-white/20"></div>
        <span className="text-[10px] text-slate-300 font-semibold">Surveillance Node</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-2 rounded bg-gradient-to-r from-blue-500 via-lime-500 to-red-500 opacity-80 border border-white/10"></div>
        <span className="text-[10px] text-slate-300 font-semibold tracking-tighter">Incident Density</span>
      </div>
    </div>
  );
};

export default function MapView({ center = [19.2045, 72.8710], markers = [], hotspots = [] }) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "400px", width: "100%", borderRadius: "0.75rem" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <HeatmapLayer points={hotspots} />
      <MapUpdater center={center} />

      {markers.map((marker, idx) => (
        <Marker key={idx} position={[marker.lat, marker.lng]}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold">{marker.name}</p>
              <p className="text-slate-500">{marker.type}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Main Incident Marker - Crime Scene */}
      <Marker position={center} icon={CrimeSceneIcon}>
        <Popup>
          <div className="text-xs font-bold text-red-600">
            PRIMARY CRIME SCENE
          </div>
        </Popup>
      </Marker>

      {/* Manual Legend Overlay */}
      <Legend />
    </MapContainer>
  );
}
