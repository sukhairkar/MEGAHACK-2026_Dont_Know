
const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: './frontend/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPDFStatus() {
  const firId = 'bdeebce7-e7b1-4ad1-af44-94dde66bb8db';
  const { data: fir, error } = await supabase
    .from('fir_reports')
    .select('id, pdf_url, fir_no')
    .eq('id', firId)
    .single();

  if (error) {
    console.error('Error fetching FIR:', error.message);
    return;
  }

  console.log('FIR Document Status:');
  console.log(`ID: ${fir.id}`);
  console.log(`FIR No: ${fir.fir_no}`);
  console.log(`PDF URL: ${fir.pdf_url || 'MISSING'}`);
}

checkPDFStatus();
