import { cookies } from 'next/headers';
import { verifyJWT } from './utils';
import { AuthPayload } from '../db/schema';

const AUTH_COOKIE_NAME = 'auth_token';

// Get auth payload from cookies
export async function getAuth(): Promise<AuthPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyJWT(token);
  return payload;
}

// Require authentication
export async function requireAuth(): Promise<AuthPayload> {
  const auth = await getAuth();
  if (!auth) {
    throw new Error('Unauthorized - Authentication required');
  }
  return auth;
}

// Require specific role
export async function requireRole(expectedRole: 'citizen' | 'officer'): Promise<AuthPayload> {
  const auth = await requireAuth();
  if (auth.userType !== expectedRole) {
    throw new Error(`Unauthorized - ${expectedRole} access required`);
  }
  return auth;
}

// Require officer with specific region
export async function requireRegion(region: string): Promise<AuthPayload> {
  const auth = await requireRole('officer');
  if (auth.region?.toLowerCase() !== region.toLowerCase()) {
    throw new Error(`Unauthorized - Access to ${region} region required`);
  }
  return auth;
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}
