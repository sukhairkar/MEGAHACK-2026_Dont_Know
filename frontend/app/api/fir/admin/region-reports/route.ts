import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db/database';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Require officer authentication
    const auth = await getAuth();
    if (!auth || auth.userType !== 'officer') {
      return NextResponse.json(
        { error: 'Unauthorized - Officer access required' },
        { status: 401 }
      );
    }

    const { data: firs, error: firError } = await supabase
      .from('fir_reports')
      .select(`
        *,
        complainants (*)
      `)
      .eq('police_station', auth.region) // Assuming auth.region holds the station name
      .order('created_at', { ascending: false });

    if (firError) {
      console.error('Supabase fetch error:', firError);
      throw firError;
    }

    // Map to frontend expected format
    const enrichedFirs = (firs || []).map((fir: any) => ({
      id: fir.id,
      firNumber: fir.fir_no,
      incidentType: fir.info_type,
      incidentDate: fir.date_from,
      incidentLocation: fir.occurrence_address,
      status: fir.is_approved ? 'Approved' : 'Open',
      priority: fir.priority || 'Medium',
      pdfUrl: fir.pdf_url,
      createdAt: fir.created_at,
      citizen: fir.complainants ? {
        fullName: fir.complainants[0]?.name,
        phone: fir.complainants[0]?.mobile
      } : undefined
    }));

    // Statistics
    const stats = {
      total: enrichedFirs.length,
      open: enrichedFirs.filter((f) => f.status === 'Open').length,
      investigating: enrichedFirs.filter((f) => f.status === 'Under Investigation').length,
      closed: enrichedFirs.filter((f) => f.status === 'Closed').length,
      pending: enrichedFirs.filter((f) => f.status === 'Pending').length,
      critical: enrichedFirs.filter((f) => f.priority === 'Critical').length,
    };

    return NextResponse.json(
      {
        station: auth.region,
        reports: enrichedFirs,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin FIR fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
