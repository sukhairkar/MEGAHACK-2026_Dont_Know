import sql from './db.js';

async function migrate() {
  try {
    console.log("Checking and updating schema...");
    
    // Add latitude and longitude columns to fir_reports if they don't exist
    await sql`
      ALTER TABLE fir_reports 
      ADD COLUMN IF NOT EXISTS latitude NUMERIC,
      ADD COLUMN IF NOT EXISTS longitude NUMERIC
    `;
    
    console.log("Migration successful: Added latitude and longitude to fir_reports.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

migrate();
