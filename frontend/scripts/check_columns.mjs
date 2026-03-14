import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
});

async function check() {
  try {
    const res = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'fir_reports'`;
    console.log("Columns in fir_reports:");
    console.log(res.map(c => c.column_name).join(", "));
  } catch (err) {
    console.error("Column check failed:", err.message);
  } finally {
    await sql.end();
  }
}

check();
