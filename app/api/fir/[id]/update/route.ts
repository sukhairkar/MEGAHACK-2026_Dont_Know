import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { db } from '@/lib/db/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require officer authentication
    const auth = await getAuth();
    if (!auth || auth.userType !== 'officer') {
      return NextResponse.json(
        { error: 'Unauthorized - Officer access required' },
        { status: 401 }
      );
    }

    const firId = params.id;
    const body = await request.json();
    const { status, priority, notes } = body;

    // Get FIR
    const fir = db.getFIRById(firId);
    if (!fir) {
      return NextResponse.json(
        { error: 'FIR not found' },
        { status: 404 }
      );
    }

    // Verify officer has access to this region
    const officer = db.getOfficerById(auth.userId);
    if (!officer || officer.region.toLowerCase() !== fir.region.toLowerCase()) {
      return NextResponse.json(
        { error: `Unauthorized - Access to ${fir.region} region required` },
        { status: 403 }
      );
    }

    // Update FIR
    if (status) {
      fir.status = status;
      if (status === 'Closed' && !fir.closedAt) {
        fir.closedAt = new Date();
      }
    }
    if (priority) fir.priority = priority;
    if (notes !== undefined) fir.notes = notes;
    if (!fir.assignedOfficerId) fir.assignedOfficerId = auth.userId;

    fir.updatedAt = new Date();
    db.saveFIR(fir);

    return NextResponse.json(
      {
        message: 'FIR updated successfully',
        fir,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('FIR update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
