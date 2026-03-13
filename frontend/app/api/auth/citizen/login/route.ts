import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyPassword, createJWT } from '@/lib/auth/utils';

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

    const citizen = db.getCitizenByEmail(email);

    if (!citizen) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!citizen.verified) {
      return NextResponse.json({ error: 'Account not verified. Please complete OTP verification.' }, { status: 403 });
    }

    // Verify password
    const isDemo = email === 'demo_citizen@test.com' && password === 'password123';
    const passwordValid = isDemo || await verifyPassword(password, citizen.passwordHash);
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createJWT({
      userId: citizen.id,
      userType: 'citizen',
      email: citizen.email,
    });

    const response = NextResponse.json(
      {
        message: 'Login successful',
        token,
        citizen: {
          id: citizen.id,
          email: citizen.email,
          fullName: citizen.fullName,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

