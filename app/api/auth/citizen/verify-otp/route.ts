import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { createJWT } from '@/lib/auth/utils';
import { Citizen } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { citizenId, aadhaar, phone, otp } = body;

    if (!otp || (!citizenId && !aadhaar && !phone)) {
      return NextResponse.json(
        { error: 'Missing identifiers or OTP' },
        { status: 400 }
      );
    }

    let citizen: Citizen | null = null;

    if (phone) {
      // Phone-based verification (New simple flow)
      const data = db.getPhoneVerification(phone);
      if (!data) {
        return NextResponse.json(
          { error: 'OTP not generated or expired' },
          { status: 404 }
        );
      }

      if (data.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // Success - Check if citizen exists
      citizen = db.getCitizenByPhone(phone);
      
      if (!citizen) {
        // Auto-registration
        console.log(`[AUTO-REG] Creating new citizen for phone ${phone}`);
        const newCitizenId = `citizen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        citizen = {
          id: newCitizenId,
          aadhaar: 'NOT_PROVIDED',
          email: `${phone}@justiceroute.gov`,
          phone: phone,
          fullName: `Citizen ${phone.slice(-4)}`,
          passwordHash: 'LOGIN_VIA_OTP', // No password needed for OTP-only flow
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.saveCitizen(citizen);
      }

      db.deletePhoneVerification(phone);
    } else if (aadhaar) {
      // Aadhaar-based verification (legacy/existing)
      const data = db.getPendingVerification(aadhaar);
      if (!data) {
        return NextResponse.json(
          { error: 'OTP not generated or expired' },
          { status: 404 }
        );
      }

      if (data.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // In real app, we return a success for the signup wizard
      return NextResponse.json(
        { 
          message: 'Aadhaar verified successfully',
          aadhaar,
          phone: data.phone,
          fullName: 'Identity Verified (Aadhaar User)', 
        },
        { status: 200 }
      );
    } else {
      // Existing citizenId-based verification
      citizen = db.getCitizenById(citizenId);
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
    }

    if (!citizen) {
       return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }

    // Create JWT token
    const token = await createJWT({
      userId: citizen.id,
      userType: 'citizen',
      email: citizen.email,
    });

    const response = NextResponse.json(
      { 
        message: 'Verification successful',
        user: {
          id: citizen.id,
          fullName: citizen.fullName,
          email: citizen.email,
          role: 'citizen'
        }
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: false, // Changed for client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
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

