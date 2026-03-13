import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const firNumber = request.nextUrl.searchParams.get('firNumber');

    if (!firNumber) {
      return NextResponse.json(
        { error: 'FIR Number is required' },
        { status: 400 }
      );
    }

    // Attempt to finding by FIR number
    const { data: fir, error } = await supabase
      .from('fir_reports')
      .select('*')
      .eq('fir_no', firNumber)
      .single();

    if (error || !fir) {
      return NextResponse.json(
        { error: 'No record found with the provided FIR identification' },
        { status: 404 }
      );
    }

    // Prepare a safe public view
    const safeResult = {
      firNumber: fir.fir_no,
      status: fir.is_approved ? 'Approved' : 'Open',
      priority: fir.priority || 'Medium',
      incidentType: fir.info_type,
      incidentLocation: fir.occurrence_address,
      region: fir.police_station, // Using station as region for public tracking
      createdAt: fir.created_at,
      updatedAt: fir.updated_at,
      firstInformationContents: fir.first_information_contents,
      notes: fir.first_information_contents,
    };

    return NextResponse.json(safeResult, { status: 200 });
  } catch (error) {
    console.error('FIR search error:', error);
    return NextResponse.json(
      { error: 'Internal server error while searching ledger' },
      { status: 500 }
    );
  }
}
