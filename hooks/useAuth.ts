'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  userId: string;
  userType: 'citizen' | 'officer';
  email: string;
  region?: string;
}

// Simple JWT decoder without external dependencies
function decodeJWT(token: string): AuthUser | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as AuthUser;
  } catch (error) {
    return null;
  }
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from cookies
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find((c) => c.trim().startsWith('auth_token='));

        if (!authCookie) {
          setLoading(false);
          return;
        }

        const token = authCookie.split('=')[1];
        const decoded = decodeJWT(token);
        if (decoded) {
          setUser(decoded);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isCitizen: user?.userType === 'citizen',
    isOfficer: user?.userType === 'officer',
    logout,
  };
}
