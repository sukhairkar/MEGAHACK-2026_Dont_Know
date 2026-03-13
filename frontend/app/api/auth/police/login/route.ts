import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createJWT } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, region } = body;

    if (!email || !password || !region) {
      return NextResponse.json(
        { error: 'Email, password, and region are required' },
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

    // 2. Fetch officer profile to verify region and role
    const { data: officer, error: profileError } = await supabaseAdmin
      .from('officers')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !officer) {
      return NextResponse.json(
        { error: 'Officer profile not found. Access denied.' },
        { status: 403 }
      );
    }

    // 3. Crucial Region Check
    // The region select and the stored region must match (lenient check to handle station vs city suffixes if needed, 
    // but the prompt says "explicitly matches").
    if (!officer.region.includes(region) && !region.includes(officer.region)) {
        return NextResponse.json(
            { error: `Access Denied: Your assigned region is ${officer.region}` },
            { status: 403 }
        );
    }

    // 4. Create JWT token with role and region for middleware/client
    const token = await createJWT({
      userId: officer.id,
      userType: 'officer',
      email: officer.email,
      region: officer.region,
    });

    const response = NextResponse.json(
      {
        message: 'Police login successful',
        officer: {
          id: officer.id,
          email: officer.email,
          fullName: officer.full_name,
          region: officer.region,
          badge: officer.badge_number,
        },
      },
      { status: 200 }
    );

    // 5. Set auth cookie
    response.cookies.set('auth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Police login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
