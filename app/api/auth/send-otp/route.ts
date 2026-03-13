import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { generateOTP, isValidPhone } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number (must be 10 digits)' },
        { status: 400 }
      );
    }

    // Rate limiting / Spam prevention (Simple demo version)
    const existing = db.getPhoneVerification(phone);
    if (existing && (new Date().getTime() - (existing.expiry.getTime() - 5 * 60 * 1000) < 60 * 1000)) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting another OTP.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes as per requirements
    
    // Save to pending phone verifications
    db.savePhoneVerification(phone, { otp, expiry });

    console.log(`[PHONE-OTP] ${otp} generated for mobile ${phone}`);

    // In a real app, integrate Twilio / MSG91 here
    // return sendSms(phone, `Your JusticeRoute OTP is ${otp}`);

    return NextResponse.json(
      {
        message: 'OTP sent to your mobile number.',
        phone: phone,
        // For demo purposes only
        demo_otp: otp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
