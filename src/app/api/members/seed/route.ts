import { NextRequest, NextResponse } from 'next/server';
import { localDb } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// POST /api/members/seed - Mengatur ulang SQLite lokal ke 15 anggota 4 generasi default
export async function POST(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }

    const resetMembers = await localDb.resetDemoData();

    return NextResponse.json({
      success: true,
      message: 'Berhasil mengatur ulang database SQLite lokal ke data demo 4 generasi.',
      source: 'sqlite_local',
      data: resetMembers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mereset database lokal.', error: error.message },
      { status: 500 }
    );
  }
}
