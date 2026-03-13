import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { hashPassword, isValidAadhaar, isValidEmail, isValidPhone, generateOTP } from '@/lib/auth/utils';
import { Citizen } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aadhaar, email, phone, fullName, password } = body;

    // Validation
    if (!aadhaar || !email || !phone || !fullName || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!isValidAadhaar(aadhaar)) {
      return NextResponse.json(
        { error: 'Invalid Aadhaar number (must be 12 digits)' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number (must be 10 digits)' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if Aadhaar already exists
    if (db.getCitizenByAadhaar(aadhaar)) {
      return NextResponse.json(
        { error: 'Aadhaar number already registered' },
        { status: 409 }
      );
    }

    // Check if email already exists
    if (db.getCitizenByEmail(email)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create citizen (Already verified via multi-step flow)
    const citizenId = `citizen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const citizen: Citizen = {
      id: citizenId,
      aadhaar,
      email,
      phone,
      fullName,
      passwordHash,
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.saveCitizen(citizen);
    
    // Clear pending verification
    db.deletePendingVerification(aadhaar);

    return NextResponse.json(
      {
        message: 'Registration complete. You can now login.',
        citizenId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

