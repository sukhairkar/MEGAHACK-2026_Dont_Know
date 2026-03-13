import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/database';
import { verifyPassword, createJWT, hashPassword } from '@/lib/auth/utils';

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

    let officer = db.getOfficerByEmail(email);
    
    // For demo purposes, create test officers with default password if they don't exist
    // In a real app, these would already be in the DB
    if (!officer) {
      const defaultPassword = 'Test@1234';
      const passwordHash = await hashPassword(defaultPassword);
      
      if (email === 'officer.borivli@police.gov') {
        officer = {
          id: 'officer-001',
          badge: 'JR001',
          email: 'officer.borivli@police.gov',
          passwordHash,
          fullName: 'Anil Kumar',
          region: 'Borivli',
          designation: 'Investigation Officer',
          phone: '9876543210',
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.saveOfficer(officer);
      } else if (email === 'officer.dahisar@police.gov') {
        officer = {
          id: 'officer-002',
          badge: 'JR002',
          email: 'officer.dahisar@police.gov',
          passwordHash,
          fullName: 'Priya Sharma',
          region: 'Dahisar',
          designation: 'Investigation Officer',
          phone: '9876543211',
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.saveOfficer(officer);
      } else if (email === 'officer.vasai@police.gov') {
        officer = {
          id: 'officer-003',
          badge: 'JR003',
          email: 'officer.vasai@police.gov',
          passwordHash,
          fullName: 'Rajesh Patel',
          region: 'Vasai',
          designation: 'Investigation Officer',
          phone: '9876543212',
          verified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.saveOfficer(officer);
      }
    }

    if (!officer) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!officer.verified) {
      return NextResponse.json(
        { error: 'Officer account not verified' },
        { status: 403 }
      );
    }

    // Verify password
    const isDemo = (email === 'officer.borivli@police.gov' || 
                   email === 'officer.dahisar@police.gov' || 
                   email === 'officer.vasai@police.gov') && password === 'Test@1234';
                   
    const passwordValid = isDemo || await verifyPassword(password, officer.passwordHash);
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT token with region
    const token = await createJWT({
      userId: officer.id,
      userType: 'officer',
      email: officer.email,
      region: officer.region,
    });

    const response = NextResponse.json(
      {
        message: 'Admin login successful',
        token,
        officer: {
          id: officer.id,
          email: officer.email,
          fullName: officer.fullName,
          region: officer.region,
          designation: officer.designation,
          badge: officer.badge,
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
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

