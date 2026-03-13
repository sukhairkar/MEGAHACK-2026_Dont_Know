import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client with service role key — never expose this to the client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }
    if (!phone || phone.trim().length < 10) {
      return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const phoneFormatted = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    // Use admin API to create user with email_confirm = true so they can log in immediately
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone: phoneFormatted,
      email_confirm: true, // auto-confirm — no email verification needed
      user_metadata: {
        phone: phoneFormatted,
        role: 'citizen',
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Account created successfully', userId: data.user?.id }, { status: 201 });

  } catch (err) {
    console.error('[REGISTER] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
