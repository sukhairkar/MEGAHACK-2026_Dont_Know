import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db } from '@/lib/db/database';

// Admin client — never expose to client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const {
      fullName, badge, email, phone,
      stationName, stationCode, department, district, password,
    } = await request.json();

    // Validate required fields
    if (!fullName || !badge || !email || !phone || !stationName || !stationCode || !department || !district || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check for duplicate badge
    const existingByBadge = db.getOfficerByBadge(badge);
    if (existingByBadge) {
      return NextResponse.json({ error: 'An officer with this badge number already exists.' }, { status: 409 });
    }

    // Check for duplicate email
    const existingByEmail = db.getOfficerByEmail(email);
    if (existingByEmail) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    // Create Supabase user with auto-confirmed email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        fullName,
        badge,
        phone,
        role: 'police',
        stationName,
        stationCode,
        department,
        district,
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return NextResponse.json({ error: 'An account with this email already exists in Supabase.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create local officer record
    const officerId = `officer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    db.saveOfficer({
      id: officerId,
      badge,
      email,
      passwordHash: 'LOGIN_VIA_SUPABASE',
      fullName,
      phone,
      stationName,
      stationCode,
      department,
      district,
      region: district, // use district as region for FIR assignment
      designation: 'Police Officer',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: 'Officer account created successfully', officerId }, { status: 201 });

  } catch (err) {
    console.error('[POLICE-REGISTER] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
