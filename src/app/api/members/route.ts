import { NextRequest, NextResponse } from 'next/server';
import { localDb } from '@/lib/db';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { FamilyMember } from '@/types/family';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// GET /api/members - Membaca seluruh silsilah keluarga dari SQLite Lokal / Turso Cloud
export async function GET() {
  try {
    const isTurso = Boolean(process.env.TURSO_DATABASE_URL);
    const members = await localDb.getAllMembers();
    return NextResponse.json({
      success: true,
      source: isTurso ? 'turso_cloud' : 'sqlite_local',
      database: isTurso ? 'Turso Cloud (AWS Singapore)' : 'data/family.db',
      data: members,
    });
  } catch (error: any) {
    console.error('Error saat membaca SQLite lokal:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal membaca data dari database lokal.', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/members - Menambah anggota keluarga baru ke SQLite Lokal (Hanya Admin)
export async function POST(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }

    const payload = await req.json();

    if (!payload.full_name || !payload.gender) {
      return NextResponse.json(
        { success: false, message: 'Nama lengkap dan jenis kelamin wajib diisi.' },
        { status: 400 }
      );
    }

    const newMember: FamilyMember = {
      id: payload.id || `member-${Date.now()}`,
      full_name: payload.full_name,
      nickname: payload.nickname || undefined,
      gender: payload.gender,
      birth_place: payload.birth_place || undefined,
      birth_date: payload.birth_date || undefined,
      death_date: payload.death_date || undefined,
      origin_city: payload.origin_city || undefined,
      current_city: payload.current_city || undefined,
      bio: payload.bio || undefined,
      photo_url: payload.photo_url || undefined,
      father_id: payload.father_id || null,
      mother_id: payload.mother_id || null,
      spouse_id: payload.spouse_id || null,
      generation: Number(payload.generation) || 1,
      family_position: payload.family_position || undefined,
    };

    const saved = await localDb.createMember(newMember);

    return NextResponse.json({
      success: true,
      source: 'sqlite_local',
      data: saved,
    });
  } catch (error: any) {
    console.error('Error saat menambah anggota ke SQLite:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan ke database lokal.', error: error.message },
      { status: 500 }
    );
  }
}
