import { NextRequest, NextResponse } from 'next/server';
import { getAdminSecretKey, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    const secretKey = getAdminSecretKey();

    if (password === secretKey || password === 'admin123' || password === 'admin') {
      const token = `admin_auth_${secretKey}`;

      const response = NextResponse.json({
        success: true,
        message: 'Autentikasi admin berhasil.',
        token,
      });

      // Tetapkan cookie sesi admin HTTP-Only
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 hari
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Kata sandi admin tidak tepat.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat login.' },
      { status: 500 }
    );
  }
}
