import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db/database';

export async function GET(request: NextRequest) {
  try {
    // Require citizen authentication
    const auth = await getAuth();
    if (!auth || auth.userType !== 'citizen') {
      return NextResponse.json(
        { error: 'Unauthorized - Citizen access required' },
        { status: 401 }
      );
    }

    // Get citizen's FIR reports
    const firs = db.getFIRsByCitizen(auth.userId);

    // Enrich with officer information
    const enrichedFirs = firs.map((fir) => ({
      ...fir,
      assignedOfficer: fir.assignedOfficerId
        ? db.getOfficerById(fir.assignedOfficerId)
        : null,
    }));

    return NextResponse.json(
      {
        reports: enrichedFirs,
        total: enrichedFirs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch FIR reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
