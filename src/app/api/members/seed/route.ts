import { NextRequest, NextResponse } from 'next/server';
import { localDb } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// POST /api/members/seed - Mengosongkan data atau mengimpor data silsilah
export async function POST(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Jika ada payload anggota untuk diimpor
    if (Array.isArray(body.members)) {
      const imported = await localDb.importMembers(body.members);
      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor ${imported.length} anggota keluarga ke database lokal.`,
        source: 'sqlite_local',
        data: imported,
      });
    }

    // Default: Kosongkan database
    await localDb.clearAllMembers();
    return NextResponse.json({
      success: true,
      message: 'Database silsilah lokal berhasil dikosongkan.',
      source: 'sqlite_local',
      data: [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses permintaan data.', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/members/seed - Reset seluruh posisi kustom kembali ke layout otomatis
export async function PUT(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }
    await localDb.resetAllCustomPositions();
    return NextResponse.json({ success: true, message: 'Posisi silsilah berhasil diatur ulang ke tata letak otomatis.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mereset posisi.', error: error.message },
      { status: 500 }
    );
  }
}
