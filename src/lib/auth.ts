import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'family_admin_token';
const DEFAULT_ADMIN_KEY = 'admin123';

export function getAdminSecretKey(): string {
  return process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_KEY;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const secret = getAdminSecretKey();
  // Validasi token sederhana berbasis secret key
  return token === `admin_auth_${secret}` || token === secret;
}

export function isAuthenticatedAdmin(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch (e) {
    return false;
  }
}

export { ADMIN_COOKIE_NAME };
