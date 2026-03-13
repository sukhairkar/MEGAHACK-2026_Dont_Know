"use client";

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Tactical Icons ──────────────────────────────────────────────────────────
const CrimeSceneIcon = L.icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41],
});

const SurveillanceIcon = L.icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41],
});

const PoliceIcon = L.icon({
  iconUrl:     "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl:   "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize:    [25, 41], iconAnchor: [12, 41],
  popupAnchor: [1, -34], shadowSize: [41, 41],
});
// ─── HeatmapLayer ─────────────────────────────────────────────────────────────
function HeatmapLayer({ points = [] }) {
  const map      = useMap();
  const heatRef  = useRef(null); 

  useEffect(() => {
    if (typeof window === "undefined" || L.heatLayer) return;
    if (document.querySelector('script[data-leaflet-heat]')) return; 

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet.heat/0.2.0/leaflet-heat.js";
    script.setAttribute("data-leaflet-heat", "true");
    script.onload  = () => console.log("[Heatmap] leaflet.heat ready.");
    script.onerror = () => console.error("[Heatmap] CDN load failed.");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!map || typeof window === "undefined") return;

    if (heatRef.current) {
      if (map.hasLayer(heatRef.current)) map.removeLayer(heatRef.current);
      heatRef.current = null;
    }

    if (!points || points.length === 0) return; 

    const draw = () => {
      const leaflet = window.L || L;
      const heatFactory = leaflet.heatLayer;

      if (!heatFactory) {
        console.warn("[Intelligence] Heatmap plugin not attached to L instance yet.");
        return false;
      }

      const heatPoints = points
        .filter((p) => p && p.lat != null && p.lng != null)
        .map((p) => [
          parseFloat(p.lat),
          parseFloat(p.lng),
          Math.min(Math.max(parseFloat(p.intensity ?? 0.8), 0.1), 1.0),
        ]);

      if (heatPoints.length === 0) {
        console.warn("[Intelligence] Heatmap source is empty.");
        return true;
      }

      heatRef.current = heatFactory(heatPoints, {
        radius:     85, 
        blur:       35, 
        maxZoom:    18,
        minOpacity: 0.85, 
        max:        1.0,
        gradient: {
          0.0:  "#1e3a5f", 
          0.2:  "#3b82f6", 
          0.4:  "#10b981", 
          0.7:  "#f59e0b", 
          1.0:  "#ef4444", 
        },
      }).addTo(map);

      return true;
    };

    if (!draw()) {
      let tries = 0;
      const poll = setInterval(() => {
        tries++;
        if (draw() || tries > 50) clearInterval(poll); 
      }, 100);
      return () => clearInterval(poll);
    }
  }, [map, points]);

  useEffect(() => () => {
    if (heatRef.current && map?.hasLayer(heatRef.current)) {
      map.removeLayer(heatRef.current);
    }
  }, [map]);

  return null;
}

// ─── useRealtimeHotspots ──────────────────────────────────────────────────────
export function useRealtimeHotspots(lat, lng, radiusMeters = 1500) {
  const [hotspots, setHotspots] = React.useState([]);
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (lat == null || lng == null) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/hotspots?lat=${lat}&lng=${lng}&radius=${radiusMeters}`, {
      signal: abortRef.current.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Hotspot API ${res.status}`);
        return res.json();
      })
      .then((data) => setHotspots(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("[Hotspots] Fetch failed:", err.message);
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => abortRef.current?.abort();
  }, [lat, lng, radiusMeters]);

  return { hotspots, loading, error };
}

// ─── MapUpdater ───────────────────────────────────────────────────────────────
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

// ─── Legend ───────────────────────────────────────────────────────────────────
const Legend = () => (
  <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl flex flex-col gap-2 min-w-[155px]">
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 border-b border-white/5 pb-1">
      Intelligence Legend
    </div>
    {[
      { color: "bg-red-500    shadow-[0_0_8px_rgba(239,68,68,0.8)]",  label: "Crime Scene"       },
      { color: "bg-blue-500   shadow-[0_0_8px_rgba(59,130,246,0.8)]", label: "Surveillance Node" },
      { color: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]",  label: "Police Station"    },
    ].map(({ color, label }) => (
      <div key={label} className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full border border-white/20 ${color}`} />
        <span className="text-[10px] text-slate-300 font-semibold">{label}</span>
      </div>
    ))}
    <div className="flex items-center gap-3 mt-1">
      <div className="w-8 h-2 rounded bg-gradient-to-r from-blue-500 via-amber-400 to-red-500 opacity-80 border border-white/10" />
      <span className="text-[10px] text-slate-300 font-semibold tracking-tight">
        Crime Hotspots (Historical)
      </span>
    </div>
  </div>
);

// ─── MapView ──────────────────────────────────────────────────────────────────
export default function MapView({
  center   = [19.2045, 72.871],
  markers  = [],
  hotspots = [],
  onCCTVSelect = () => {},
  cctvSources = [],
  selectedSource = "",
}) {
  return (
    <div className="relative group/map rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        key={`map-${center[0]}-${center[1]}`}
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "500px", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ZoomControl position="bottomleft" />

        <HeatmapLayer points={hotspots} />
        <MapUpdater center={center} />

        {markers
          .filter((m) => m && m.lat != null && m.lng != null)
          .map((marker, idx) => (
            <Marker
              key={`${marker.name || "m"}-${idx}`}
              position={[parseFloat(marker.lat), parseFloat(marker.lng)]}
              icon={marker.type === "Police Station" ? PoliceIcon : SurveillanceIcon}
            >
              <Popup>
                <div className="text-xs">
                  <p className="font-bold">{marker.name}</p>
                  <p className="text-slate-500 font-medium">{marker.type}</p>
                  {marker.distance_meters && (
                    <p className="text-[10px] text-emerald-500 font-bold mt-1">
                      {(marker.distance_meters / 1000).toFixed(2)} km from scene
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {center?.[0] != null && center?.[1] != null && (
          <Marker position={center} icon={CrimeSceneIcon}>
            <Popup>
              <div className="text-xs font-bold text-red-600">PRIMARY CRIME SCENE</div>
            </Popup>
          </Marker>
        )}

        <Legend />
      </MapContainer>
    </div>
  );
}