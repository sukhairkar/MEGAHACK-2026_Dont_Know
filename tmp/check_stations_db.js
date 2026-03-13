
const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStations() {
  const { data, error } = await supabase
    .from('fir_reports')
    .select('police_station, fir_no');

  if (error) {
    console.error('Error fetching stations:', error);
    return;
  }

  console.log('Unique station values in DB:');
  const stations = [...new Set(data.map(f => f.police_station))];
  console.log(stations);
  
  console.log('All FIRs and their stations:');
  data.forEach(f => console.log(`- ${f.fir_no}: ${f.police_station}`));
}

checkStations();
