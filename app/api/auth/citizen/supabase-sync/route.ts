import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { createJWT } from '@/lib/auth/utils';
import { supabase } from '@/lib/supabase/client';
import { Citizen } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid Supabase token' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    let citizen: Citizen | null = null;
    let fallbackEmail = email || user.email;

    // Check by Email
    if (fallbackEmail) {
      citizen = db.getCitizenByEmail(fallbackEmail);
    }

    // Auto-registration
    if (!citizen && fallbackEmail) {
      const newCitizenId = `citizen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Pull phone from Supabase user_metadata if it was set during admin registration
      const metaPhone = user.user_metadata?.phone || 'NOT_PROVIDED';
      
      console.log(`[AUTO-REG-SUPABASE] Creating new citizen for ${fallbackEmail}`);
      
      citizen = {
        id: newCitizenId,
        aadhaar: 'NOT_PROVIDED',
        email: fallbackEmail,
        phone: metaPhone,
        fullName: `Citizen ${fallbackEmail.split('@')[0]}`,
        passwordHash: 'LOGIN_VIA_SUPABASE',
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.saveCitizen(citizen);
    }

    if (!citizen) {
       return NextResponse.json({ error: 'Could not resolve citizen identity from token' }, { status: 400 });
    }

    // Create custom JWT token to sync with existing middleware
    const systemToken = await createJWT({
      userId: citizen.id,
      userType: 'citizen',
      email: citizen.email,
    });

    const response = NextResponse.json(
      { 
        message: 'Sync successful',
        user: {
          id: citizen.id,
          fullName: citizen.fullName,
          email: citizen.email,
          role: 'citizen'
        }
      },
      { status: 200 }
    );

    // Set custom auth cookie
    response.cookies.set('auth_token', systemToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Supabase sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
