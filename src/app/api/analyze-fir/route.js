import { NextResponse } from "next/server";
import aiClient from "@/lib/ai-client";
import legalSections from "@/lib/legal_sections.json";
import { OpenLocationCode } from "open-location-code";
import sql from "@/lib/db";

// Helper for Nominatim Geocoding with Fallbacks
async function geocode(address) {
  console.log("Geocoding address:", address);
  
  const attemptGeocode = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'JusticeRoute/1.0' }
      });
      const data = await res.json();
      return data && data[0] ? { 
        lat: parseFloat(data[0].lat), 
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name 
      } : null;
    } catch (e) {
      console.error(`Geocoding failed for "${query}":`, e.message);
      return null;
    }
  };

  // Attempt 1: Full address
  let coords = await attemptGeocode(address);
  if (coords) return coords;

  // Attempt 2: Simplified address (remove specific details like "Plot No", "Floor", etc.)
  const simplified = address
    .replace(/(Plot|Flat|Room|Floor|House|Bldg|Building|No|#)\.?\s?\d+/gi, '')
    .replace(/,\s*,/g, ',')
    .trim();
  
  if (simplified !== address) {
    console.log("Attempting fallback geocode with:", simplified);
    coords = await attemptGeocode(simplified);
    if (coords) return coords;
  }

  // Attempt 3: Just the city and landmark/area
  const parts = address.split(',').map(p => p.trim());
  if (parts.length > 2) {
    const areaCity = parts.slice(-2).join(', ');
    console.log("Attempting final fallback geocode with:", areaCity);
    coords = await attemptGeocode(areaCity);
    return coords;
  }

  return null;
}

// Helper for Overpass API (Nearby Places & Actual CCTV)
async function getNearbyPlaces(lat, lng) {
  const query = `[out:json];
    (
      node["amenity"="police"](around:3000,${lat},${lng});
      node["man_made"="surveillance"](around:1000,${lat},${lng});
      node["highway"="traffic_signals"](around:800,${lat},${lng});
      node["amenity"~"bank|atm|fuel"](around:1000,${lat},${lng});
    );
    out;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query
    });
    const data = await res.json();
    return data.elements.map(el => {
      let type = el.tags.amenity || el.tags.highway || el.tags.man_made || "Surveillance";
      if (type === 'surveillance') type = 'CCTV Camera';
      if (type === 'traffic_signals') type = 'Traffic Signal (CCTV)';
      if (type === 'fuel') type = 'Petrol Pump (CCTV)';
      
      return {
        name: el.tags.name || type,
        type: type,
        lat: el.lat,
        lng: el.lon,
        is_real: true,
        distance_meters: Math.round(L_dist(lat, lng, el.lat, el.lon))
      };
    });
  } catch (e) {
    console.error("Overpass failed:", e);
    return [];
  }
}

// Simple distance helper (approximation)
function L_dist(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // meters
  const f1 = lat1 * Math.PI/180;
  const f2 = lat2 * Math.PI/180;
  const df = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(df/2) * Math.sin(df/2) +
            Math.cos(f1) * Math.cos(f2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper for OSRM (Escape Routes)
async function getEscapeRoutes(lat, lng) {
  // Simple: find routes to two offsets (North and South) to simulate escape directions
  const targets = [
    { name: "North Exit", lat: lat + 0.01, lng: lng + 0.01 },
    { name: "South Exit", lat: lat - 0.01, lng: lng - 0.01 }
  ];
  
  const routes = [];
  for (const t of targets) {
    try {
      const res = await fetch(`http://router.project-osrm.org/route/v1/driving/${lng},${lat};${t.lng},${t.lat}?overview=false`);
      const data = await res.json();
      if (data.code === "Ok") {
        routes.push({
          route_name: `Route to ${t.name}`,
          distance_km: (data.routes[0].distance / 1000).toFixed(1),
          direction: t.lat > lat ? "North" : "South"
        });
      }
    } catch (e) { console.error("OSRM failed:", e); }
  }
  return routes;
}

export async function POST(req) {
  try {
    const { text } = await req.json();

    // 1. Use Groq to parse FIR text and suggest investigation steps
    const aiResponse = await aiClient.getChatCompletion({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an AI Investigation Assistant for India Law Enforcement. You have access to a specialized Legal Knowledge Base of IPC (Indian Penal Code) and BNS (Bharatiya Nyaya Sanhita) sections.
          
          LEGAL KNOWLEDGE BASE:
          ${JSON.stringify(legalSections, null, 2)}
          
          TASK:
          1. Analyze the FIR text provided.
          2. EXTRACT relevant IPC/BNS sections based on the LEGAL KNOWLEDGE BASE provided above. If the incident matches a category (e.g., Theft, Murder, Harassment), suggest the appropriate section(s) with their offence name and description.
          3. Extract incident location and convert it into a specific address.
          4. Generate investigation roadmap and suggestions.
          5. Generate map visualization data:
             - crime_hotspot_heatmap: 3–6 points within 300–500m of the incident. Intensity 0.4–0.9.
             - nearby_cctv_sources: 4–8 sources within 200–300m (types: traffic signals, banks, ATMs, petrol pumps, shops, metro stations).
          
          IMPORTANT:
          - Return ONLY valid JSON.
          - In the "ipc_sections" array, include: {"act": "IPC/BNS", "section": "string", "offence": "string", "description": "string"}.
          
          OUTPUT FORMAT (JSON ONLY):
          {
            "address": "string",
            "ipc_sections": [{"act": "string", "section": "string", "offence": "string", "description": "string"}],
            "investigation_roadmap": ["string"],
            "suggestions": ["string"],
            "crime_hotspot_heatmap": [{"lat": "number", "lng": "number", "intensity": "number"}],
            "nearby_cctv_sources": [{"type": "string", "name": "string", "lat": "number", "lng": "number", "distance_meters": "number"}]
          }`
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(aiResponse.choices[0].message.content);
    
    // Safety check: Convert address object to string if model returns a structured object
    if (typeof parsed.address === 'object' && parsed.address !== null) {
      parsed.address = Object.values(parsed.address).filter(Boolean).join(", ");
    }
    
    // 2. Geocode the address
    const geocoded = await geocode(parsed.address);
    const coords = geocoded || { lat: 19.2045, lng: 72.8710, display_name: parsed.address }; 
    console.log("Final Coordinates used:", coords);

    // 3. Get Nearby Places
    const nearby = await getNearbyPlaces(coords.lat, coords.lng);
    console.log(`Found ${nearby.length} nearby places.`);

    // 4. Get Escape Routes
    const escapeRoutes = await getEscapeRoutes(coords.lat, coords.lng);

    // 5. Construct response
    const olc = new OpenLocationCode();
    const plusCode = olc.encode(coords.lat, coords.lng);

    // 6. Persist to Database for Real Hotspots
    try {
      await sql`
        INSERT INTO fir_reports (
          district,
          occurrence_address,
          latitude,
          longitude,
          first_information_contents
        ) VALUES (
          ${parsed.district || 'Unknown'},
          ${coords.display_name || parsed.address},
          ${coords.lat},
          ${coords.lng},
          ${text}
        )
      `;
      console.log("Incident persisted to database.");
    } catch (dbErr) {
      console.error("Database persistence failed:", dbErr.message);
    }

    // 7. Get Real Hotspots from Database (Historical data)
    let realHotspots = [];
    try {
      const history = await sql`
        SELECT latitude, longitude 
        FROM fir_reports 
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      realHotspots = history.map(h => ({
        lat: parseFloat(h.latitude),
        lng: parseFloat(h.longitude),
        intensity: 0.8
      }));
      console.log(`Retrieved ${realHotspots.length} real hotspots from history.`);
    } catch (histErr) {
      console.error("Failed to fetch historical hotspots:", histErr.message);
    }

    const analysis = {
      incident_information: {
        address: coords.display_name || parsed.address,
        latitude: coords.lat.toFixed(6),
        longitude: coords.lng.toFixed(6),
        plus_code: plusCode,
        direction_distance_from_police_station: "Calculated from MapView",
        beat_number: "TBD"
      },
      ipc_sections: parsed.ipc_sections || [],
      map_visualization: {
        incident_location: coords
      },
      nearby_police_stations: nearby.filter(p => p.type === 'police'),
      nearby_cctv_sources: [
        ...nearby.filter(p => p.type !== 'police'),
        ...(parsed.nearby_cctv_sources || []).map(s => ({ ...s, is_real: false }))
      ].sort((a, b) => a.distance_meters - b.distance_meters).slice(0, 15),
      crime_hotspot_heatmap: realHotspots.length > 0 ? realHotspots : (parsed.crime_hotspot_heatmap || []),
      possible_escape_routes: escapeRoutes.length > 0 ? escapeRoutes : [
        { route_name: "Principal Artery 1", distance_km: "1.2", direction: "North" }
      ],
      investigation_roadmap: parsed.investigation_roadmap || [],
      ai_investigation_suggestions: parsed.suggestions || [],
      evidence: {
        available: true,
        description: "Standard investigative traces."
      }
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis API Internal Error:", error);
    return NextResponse.json({ error: "Failed to analyze FIR" }, { status: 500 });
  }
}
