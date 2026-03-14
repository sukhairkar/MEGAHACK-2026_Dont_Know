import sql from './src/lib/db.js';
async function run() {
  try {
    const count = await sql`SELECT count(*) FROM fir_reports`;
    console.log("REPORTS_COUNT:", count[0].count);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
