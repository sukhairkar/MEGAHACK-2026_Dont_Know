import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';

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
    const fir = db.getFIRs().find(f => f.firNumber.toLowerCase() === firNumber.toLowerCase());

    if (!fir) {
      return NextResponse.json(
        { error: 'No record found with the provided FIR identification' },
        { status: 404 }
      );
    }

    // Prepare a safe public view (omit citizen sensitive info for public tracking)
    // In a real app, you might require OTP for full access, but for tracking status it's fine
    const safeResult = {
      firNumber: fir.firNumber,
      status: fir.status,
      priority: fir.priority,
      incidentType: fir.incidentType,
      incidentLocation: fir.incidentLocation,
      region: fir.region,
      createdAt: fir.createdAt,
      updatedAt: fir.updatedAt,
      firstInformationContents: fir.firstInformationContents,
      notes: fir.notes,
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
