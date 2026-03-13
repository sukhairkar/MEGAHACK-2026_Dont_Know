import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName, phone, aadhaar } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Create user in Supabase Auth using Admin SDK to bypass email verification
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'citizen', fullName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    // 2. Create profile in citizens table
    const { error: profileError } = await supabaseAdmin
      .from('citizens')
      .insert({
        id: userId,
        full_name: fullName,
        email: email,
        phone: phone,
        aadhaar: aadhaar,
        is_verified: true
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Attempt to clean up auth user if profile creation fails?
      // await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Citizen registered successfully', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
