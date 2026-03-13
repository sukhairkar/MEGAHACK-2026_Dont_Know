
const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFIR() {
  const firId = 'bdeebce7-e7b1-4ad1-af44-94dde66bb8db';
  console.log(`Checking FIR ID: ${firId}`);
  
  const { data: fir, error } = await supabase
    .from('fir_reports')
    .select('id, police_station, fir_no')
    .eq('id', firId)
    .single();

  if (error) {
    console.error('Error fetching FIR:', error.message);
    
    // List some recently created FIRs instead
    const { data: recent } = await supabase
      .from('fir_reports')
      .select('id, police_station, fir_no')
      .order('created_at', { ascending: false })
      .limit(5);
    
    console.log('\nRecent FIRs in DB:');
    recent?.forEach(f => console.log(`- ${f.id}: [${f.police_station}] ${f.fir_no}`));
    return;
  }

  console.log('FIR found:');
  console.log(JSON.stringify(fir, null, 2));
}

debugFIR();
