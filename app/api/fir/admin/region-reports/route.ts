import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db/database';

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

    // Get region from query params
    const region = request.nextUrl.searchParams.get('region') || auth.region;
    if (!region) {
      return NextResponse.json(
        { error: 'Region is required' },
        { status: 400 }
      );
    }

    // Verify officer has access to this region
    const officer = db.getOfficerById(auth.userId);
    if (!officer || officer.region.toLowerCase() !== region.toLowerCase()) {
      return NextResponse.json(
        { error: `Unauthorized - Access to ${region} region required` },
        { status: 403 }
      );
    }

    // Get FIRs for this region
    const firs = db.getFIRsByRegion(region);

    // Enrich with citizen information
    const enrichedFirs = firs.map((fir) => ({
      ...fir,
      citizen: db.getCitizenById(fir.citizenId),
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
        region,
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
