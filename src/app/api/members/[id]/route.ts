import { NextRequest, NextResponse } from 'next/server';
import { createServerAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { serverStore } from '@/lib/serverStore';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// GET /api/members/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (isSupabaseConfigured()) {
    const supabase = createServerAdminClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }
    }
  }

  const member = serverStore.getById(id);
  if (!member) {
    return NextResponse.json(
      { success: false, message: 'Anggota tidak ditemukan.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: member });
}

// PUT /api/members/[id] - Memperbarui profil anggota (Admin)
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

    if (isSupabaseConfigured()) {
      const supabase = createServerAdminClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('family_members')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return NextResponse.json(
            { success: false, message: `Gagal memperbarui di Supabase: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, data });
      }
    }

    const updated = serverStore.update(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Anggota keluarga tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memperbarui data.' },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - Menghapus anggota (Admin)
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

    if (isSupabaseConfigured()) {
      const supabase = createServerAdminClient();
      if (supabase) {
        const { error } = await supabase
          .from('family_members')
          .delete()
          .eq('id', id);

        if (error) {
          return NextResponse.json(
            { success: false, message: `Gagal menghapus di Supabase: ${error.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Anggota berhasil dihapus dari database.',
        });
      }
    }

    const deleted = serverStore.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Anggota keluarga tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Anggota berhasil dihapus.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat menghapus data.' },
      { status: 500 }
    );
  }
}
