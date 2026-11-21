import { NextRequest, NextResponse } from 'next/server';
import { createServerAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// POST /api/upload - Mengunggah foto profil (Supabase Storage / Data URL)
export async function POST(req: NextRequest) {
  try {
    if (!checkAdminAuth(req)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Diperlukan sesi Admin terautentikasi.' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Berkas foto tidak ditemukan.' },
        { status: 400 }
      );
    }

    // Periksa ukuran berkas (maksimal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran foto maksimal adalah 5MB.' },
        { status: 400 }
      );
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Jika Supabase Storage aktif
    if (isSupabaseConfigured()) {
      const supabase = createServerAdminClient();
      if (supabase) {
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error: uploadError } = await supabase.storage
          .from('family-avatars')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: false,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('family-avatars')
            .getPublicUrl(fileName);

          return NextResponse.json({
            success: true,
            photoUrl: urlData.publicUrl,
            source: 'supabase_storage',
          });
        }
        console.warn('Gagal unggah ke Supabase Storage, menggunakan fallback data URL:', uploadError);
      }
    }

    // Fallback lokal: Konversi ke Base64 Data URL
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      photoUrl: base64Data,
      source: 'local_base64',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal memproses unggahan foto.' },
      { status: 500 }
    );
  }
}
