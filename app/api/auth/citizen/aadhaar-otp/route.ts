import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { isValidAadhaar, generateOTP } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aadhaar } = body;

    if (!aadhaar || !isValidAadhaar(aadhaar)) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number (must be 12 digits)' },
        { status: 400 }
      );
    }

    // Check if Aadhaar already fully registered and verified
    const existingCitizen = db.getCitizenByAadhaar(aadhaar);
    if (existingCitizen && existingCitizen.verified) {
      return NextResponse.json(
        { error: 'Aadhaar number already registered. Please login.' },
        { status: 409 }
      );
    }

    // Generate OTP and mock phone number
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // For demo, we either use existing phone if found, or generate a random one
    const phone = existingCitizen?.phone || `98${Math.floor(Math.random() * 90000000 + 10000000)}`;
    
    // Save to pending verifications
    db.savePendingVerification(aadhaar, { otp, expiry, phone });

    console.log(`[AADHAAR-OTP] ${otp} generated for Aadhaar ${aadhaar}, phone ${phone}`);

    return NextResponse.json(
      {
        message: 'OTP sent to your Aadhaar-registered mobile number.',
        maskedPhone: `+91 ******${phone.slice(-4)}`,
        // For demo purposes only
        demo_otp: otp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Aadhaar OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
