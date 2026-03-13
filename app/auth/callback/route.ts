import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/citizen/login?step=sync';

  if (code) {
    const supabase = await createClient();
    // Exchange the code for a Supabase session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Successful exchange, redirect to the sync step to establish local session
      return NextResponse.redirect(new URL(next, request.url));
    }
    
    // Log the error for debugging
    console.error('Supabase exchangeCodeForSession error:', error.message);
  }

  // If there's an error or no code, redirect back to login with an error
  return NextResponse.redirect(
    new URL('/citizen/login?error=Invalid%20or%20expired%20magic%20link', request.url)
  );
}
