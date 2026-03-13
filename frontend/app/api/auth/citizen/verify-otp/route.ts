import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { createJWT } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citizenId, otp } = body;

    if (!citizenId || !otp) {
      return NextResponse.json(
        { error: 'Missing citizenId or OTP' },
        { status: 400 }
      );
    }

    const citizen = db.getCitizenById(citizenId);
    if (!citizen) {
      return NextResponse.json(
        { error: 'Citizen not found' },
        { status: 404 }
      );
    }

    // Check OTP validity
    if (!citizen.otp || !citizen.otpExpiry) {
      return NextResponse.json(
        { error: 'OTP not generated' },
        { status: 400 }
      );
    }

    if (new Date() > citizen.otpExpiry) {
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      );
    }

    if (citizen.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Mark as verified
    citizen.verified = true;
    citizen.otp = undefined;
    citizen.otpExpiry = undefined;
    citizen.updatedAt = new Date();
    db.saveCitizen(citizen);

    // Create JWT token
    const token = await createJWT({
      userId: citizen.id,
      userType: 'citizen',
      email: citizen.email,
    });

    // Set auth cookie
    const response = NextResponse.json(
      {
        message: 'OTP verified successfully',
        token,
        citizen: {
          id: citizen.id,
          email: citizen.email,
          fullName: citizen.fullName,
        },
      },
      { status: 200 }
    );

    // Set the cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

