import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function POST(req) {
  try {
    const data = await req.json();
    const { case_id, fir_text, roadmap, generated_at, ipc_suggestions } = data;

    // Store in the database mapped to the case_id (plus_code)
    // We update the existing record if it exists
    await sql`
      UPDATE fir_reports 
      SET 
        investigation_roadmap = ${sql.json(roadmap)},
        suggestions = ${sql.json(ipc_suggestions || [])},
        first_information_contents = ${fir_text}
      WHERE plus_code = ${case_id} OR id::text = ${case_id}
    `;

    console.log(`[Intelligence] Roadmap synced for ${case_id}`);
    return NextResponse.json({ status: "success", message: "Roadmap stored successfully" });
  } catch (err) {
    console.error("Save roadmap failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
