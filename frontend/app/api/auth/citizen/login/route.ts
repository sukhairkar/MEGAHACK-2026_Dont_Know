import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createJWT } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // 2. Fetch citizen profile
    const { data: citizen, error: profileError } = await supabaseAdmin
      .from('citizens')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !citizen) {
      return NextResponse.json(
        { error: 'Citizen profile not found. Access denied.' },
        { status: 403 }
      );
    }

    // 3. Create JWT token
    const token = await createJWT({
      userId: citizen.id,
      userType: 'citizen',
      email: citizen.email,
    });

    const response = NextResponse.json(
      {
        message: 'Citizen login successful',
        citizen: {
          id: citizen.id,
          email: citizen.email,
          fullName: citizen.full_name,
        },
      },
      { status: 200 }
    );

    // 4. Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Citizen login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
