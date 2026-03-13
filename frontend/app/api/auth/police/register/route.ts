import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      fullName, 
      badgeNumber, 
      phone, 
      department, 
      stationName, 
      stationCode, 
      region 
    } = body;

    if (!email || !password || !fullName || !badgeNumber || !stationName || !region) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Create user in Supabase Auth using Admin SDK
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'officer', fullName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    // 2. Create profile in officers table
    const { error: profileError } = await supabaseAdmin
      .from('officers')
      .insert({
        id: userId,
        badge_number: badgeNumber,
        full_name: fullName,
        email: email,
        phone: phone,
        department: department,
        station_name: stationName,
        station_code: stationCode,
        region: region,
        is_verified: false // Officers require manual approval or specific flow
      });

    if (profileError) {
      console.error('Officer Profile creation error:', profileError);
      return NextResponse.json({ error: 'Failed to create officer profile' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Officer registered successfully', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Officer registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
