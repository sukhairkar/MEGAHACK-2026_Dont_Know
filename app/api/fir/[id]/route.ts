import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const firId = params.id;
    const fir = db.getFIRById(firId);

    if (!fir) {
      return NextResponse.json(
        { error: 'FIR not found' },
        { status: 404 }
      );
    }

    // Role-based access control
    if (auth.userType === 'citizen') {
      if (fir.citizenId !== auth.userId) {
        return NextResponse.json(
          { error: 'Unauthorized - Access to this FIR is Restricted' },
          { status: 403 }
        );
      }
    } else if (auth.userType === 'officer') {
      if (fir.region.toLowerCase() !== auth.region?.toLowerCase()) {
        return NextResponse.json(
          { error: `Unauthorized - Access to ${fir.region} region required` },
          { status: 403 }
        );
      }
    }

    // Enrich with citizen details
    const result = {
      ...fir,
      citizen: db.getCitizenById(fir.citizenId),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Fetch FIR error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
