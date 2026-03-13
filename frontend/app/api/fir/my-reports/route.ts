import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/middleware';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Require citizen authentication
    const auth = await getAuth();
    if (!auth || auth.userType !== 'citizen') {
      return NextResponse.json(
        { error: 'Unauthorized - Citizen access required' },
        { status: 401 }
      );
    }

    // 1. Fetch citizen profile to get email/id if needed, but we can query by email directly
    // since complainants table has name/mobile, but not necessarily auth_id.
    // However, fir_reports doesn't have a direct citizen_id column in the user's provided schema.
    
    // Wait, let's check the schema again. 
    // fir_reports: id, district, fir_no, ...
    // complainants: id, fir_id, name, ...
    
    // There is NO column in fir_reports or complainants that links to auth.users. 
    // This is a problem for "my-reports". 
    // We should probably have a citizen_id in fir_reports or links in complainants.
    
    // For now, I'll filter by complainant name or mobile if matching the auth profile, 
    // OR I should propose adding a user_id to fir_reports.
    
    // Actually, looking at the user's provided schema in Step 2058:
    // CREATE TABLE IF NOT EXISTS public.citizens (id UUID PRIMARY KEY REFERENCES auth.users(id)...)
    
    // And complainants (Step 2058):
    // CREATE TABLE complainants (id uuid primary key..., fir_id uuid references fir_reports(id)...)
    
    // If we want "My Reports", we need to link FIR to a Citizen.
    // I will use the email address as the bridge for now, or check if I should add a column.
    
    const { data: firs, error: firError } = await supabase
      .from('fir_reports')
      .select(`
        *,
        complainants!inner (*)
      `)
      .eq('complainants.mobile', auth.userId) // This is a placeholder logic
      .order('created_at', { ascending: false });

    // Actually, a better way is to query complainants by the authenticated user's profile details.
    // Let's first get the citizen profile.
    
    const { data: profile } = await supabase
      .from('citizens')
      .select('*')
      .eq('id', auth.userId)
      .single();

    if (!profile) {
      return NextResponse.json({ reports: [], total: 0 });
    }

    const { data: userFirs, error } = await supabase
      .from('fir_reports')
      .select(`
        *,
        complainants!inner (*)
      `)
      .eq('complainants.mobile', profile.phone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch FIR reports error:', error);
      throw error;
    }

    return NextResponse.json(
      {
        reports: userFirs || [],
        total: (userFirs || []).length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fetch FIR reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
