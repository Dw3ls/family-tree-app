import { NextRequest, NextResponse } from 'next/server';
import { createServerAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { serverStore } from '@/lib/serverStore';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { FamilyMember } from '@/types/family';

// Helper verifikasi admin dari request
function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// GET /api/members - Membaca seluruh anggota keluarga (Publik / Read-Only)
export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createServerAdminClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('family_members')
          .select('*')
          .order('generation', { ascending: true })
          .order('birth_date', { ascending: true });

        if (!error && data) {
          return NextResponse.json({
            success: true,
            source: 'supabase',
            data: data as FamilyMember[],
          });
        }
        console.warn('Gagal membaca data dari Supabase, beralih ke penyimpanan lokal:', error);
      }
    }

    // Fallback: Penyimpanan lokal server
    const members = serverStore.getAll();
    return NextResponse.json({
      success: true,
      source: 'local_store',
      data: members,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data anggota keluarga.' },
      { status: 500 }
    );
  }
}

// POST /api/members - Menambah anggota keluarga baru (Hanya Admin)
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
      nickname: payload.nickname || null,
      gender: payload.gender,
      birth_place: payload.birth_place || null,
      birth_date: payload.birth_date || null,
      death_date: payload.death_date || null,
      origin_city: payload.origin_city || null,
      current_city: payload.current_city || null,
      bio: payload.bio || null,
      photo_url: payload.photo_url || null,
      father_id: payload.father_id || null,
      mother_id: payload.mother_id || null,
      spouse_id: payload.spouse_id || null,
      generation: Number(payload.generation) || 1,
      family_position: payload.family_position || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      const supabase = createServerAdminClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('family_members')
          .insert([newMember])
          .select()
          .single();

        if (error) {
          console.error('Error saat insert ke Supabase:', error);
          return NextResponse.json(
            { success: false, message: `Gagal menyimpan ke database Supabase: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          source: 'supabase',
          data,
        });
      }
    }

    // Fallback: Penyimpanan lokal server
    const saved = serverStore.insert(newMember);
    return NextResponse.json({
      success: true,
      source: 'local_store',
      data: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses penambahan anggota keluarga.' },
      { status: 500 }
    );
  }
}
