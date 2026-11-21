import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');

  const isValid = verifyAdminToken(cookieToken || headerToken);

  return NextResponse.json({
    isAdmin: isValid,
  });
}
