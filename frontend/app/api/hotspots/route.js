import { NextResponse } from "next/server";
import sql from "@/lib/db";

async function getRealHotspots(anchorLat, anchorLng, radiusMeters = 1500) {
  try {
    const rows = await sql`
      SELECT
        ROUND(CAST(latitude  AS NUMERIC), 3) AS grid_lat,
        ROUND(CAST(longitude AS NUMERIC), 3) AS grid_lng,
        COUNT(*)::int                         AS incident_count
      FROM fir_reports
      WHERE
        latitude  IS NOT NULL
        AND longitude IS NOT NULL
        AND (
          6371000 * acos(
            LEAST(1.0,
              cos(radians(${anchorLat}))
              * cos(radians(CAST(latitude AS DOUBLE PRECISION)))
              * cos(radians(CAST(longitude AS DOUBLE PRECISION)) - radians(${anchorLng}))
              + sin(radians(${anchorLat}))
              * sin(radians(CAST(latitude AS DOUBLE PRECISION)))
            )
          )
        ) <= ${radiusMeters}
      GROUP BY grid_lat, grid_lng
      ORDER BY incident_count DESC
      LIMIT 500
    `;

    if (rows.length === 0) return [];

    const maxCount = rows[0].incident_count;
    return rows.map((r) => ({
      lat:       parseFloat(r.grid_lat),
      lng:       parseFloat(r.grid_lng),
      intensity: parseFloat(r.incident_count) / maxCount,
    }));
  } catch (err) {
    console.error("Hotspot query failed:", err.message);
    return [];
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat    = parseFloat(searchParams.get("lat"));
  const lng    = parseFloat(searchParams.get("lng"));
  const radius = parseInt(searchParams.get("radius") ?? "1500", 10);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const hotspots = await getRealHotspots(lat, lng, radius);
  return NextResponse.json(hotspots);
}
