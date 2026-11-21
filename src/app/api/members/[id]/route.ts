import { NextRequest, NextResponse } from 'next/server';
import { localDb } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// GET /api/members/[id] - Ambil satu anggota dari SQLite Lokal
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await localDb.getMemberById(params.id);
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Anggota tidak ditemukan di database lokal.' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, source: 'sqlite_local', data: member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data dari database lokal.' },
      { status: 500 }
    );
  }
}

// PUT /api/members/[id] - Perbarui profil anggota di SQLite Lokal (Admin)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();

    const updated = await localDb.updateMember(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Anggota keluarga tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, source: 'sqlite_local', data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui di database lokal.' },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - Hapus anggota dari SQLite Lokal (Admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const deleted = await localDb.deleteMember(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Anggota keluarga tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      source: 'sqlite_local',
      message: 'Anggota berhasil dihapus dari database lokal.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus anggota dari database lokal.' },
      { status: 500 }
    );
  }
}
