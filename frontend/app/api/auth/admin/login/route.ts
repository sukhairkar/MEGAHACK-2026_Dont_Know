import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyPassword, createJWT, hashPassword } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    let officer = db.getOfficerByEmail(email);
    
    // For demo purposes, create test officers with default password if they don't exist
    if (!officer && email.endsWith('@police.gov')) {
      const parts = email.split('.');
      if (parts.length >= 2 && parts[0] === 'officer') {
        const stationPart = parts[1].split('@')[0]; // colaba, vasai, etc.
        const stationName = stationPart.charAt(0).toUpperCase() + stationPart.slice(1);
        
        let finalRegion = `${stationName} Police Station`;
        if (stationPart === 'vasai') finalRegion = 'Vasai Road Police Station';
        
        const defaultPassword = 'Test@1234';
        const passwordHash = await hashPassword(defaultPassword);
        
        officer = {
          id: `off-${stationPart}`,
          badge: `JR-${stationPart.toUpperCase()}`,
          email: email,
          passwordHash,
          fullName: `Inspector ${stationName}`,
          region: finalRegion,
          designation: 'Inspection Officer',
          phone: `987654${Math.floor(Math.random() * 9000).toString().padStart(4, '0')}`,
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.saveOfficer(officer);
      }
    }

    if (!officer) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!officer.verified) {
      return NextResponse.json(
        { error: 'Officer account not verified' },
        { status: 403 }
      );
    }

    // Verify password - For demo purposes, allow Test@1234 for all government emails
    const isDemo = email.endsWith('@police.gov') && password === 'Test@1234';
                   
    const passwordValid = isDemo || await verifyPassword(password, officer.passwordHash);
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token with region
    const token = await createJWT({
      userId: officer.id,
      userType: 'officer',
      email: officer.email,
      region: officer.region,
    });

    const response = NextResponse.json(
      {
        message: 'Admin login successful',
        token,
        officer: {
          id: officer.id,
          email: officer.email,
          fullName: officer.fullName,
          region: officer.region,
          designation: officer.designation,
          badge: officer.badge,
        },
      },
      { status: 200 }
    );

    // Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

