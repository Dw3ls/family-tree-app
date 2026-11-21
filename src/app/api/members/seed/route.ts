import { NextRequest, NextResponse } from 'next/server';
import { createServerAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { serverStore } from '@/lib/serverStore';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { INITIAL_FAMILY_MEMBERS } from '@/data/initialFamilyData';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// POST /api/members/seed - Mengatur ulang pohon keluarga ke 4 generasi data demo
export async function POST(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = createServerAdminClient();
      if (supabase) {
        // Hapus data lama
        await supabase.from('family_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // Masukkan data demo
        const { error } = await supabase
          .from('family_members')
          .insert(INITIAL_FAMILY_MEMBERS);

        if (error) {
          return NextResponse.json(
            { success: false, message: `Gagal seeding Supabase: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Berhasil melakukan seed data demo ke Supabase.',
          source: 'supabase',
        });
      }
    }

    const resetMembers = serverStore.reset();
    return NextResponse.json({
      success: true,
      message: 'Berhasil mengatur ulang ke data demo awal.',
      source: 'local_store',
      data: resetMembers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat reset data demo.' },
      { status: 500 }
    );
  }
}
