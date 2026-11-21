import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// POST /api/upload - Menyimpan berkas foto profil secara lokal di public/uploads/
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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran foto maksimal adalah 5MB.' },
        { status: 400 }
      );
    }

    // Buat direktori penyimpanan lokal public/uploads/ jika belum ada
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = path.resolve(uploadsDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      photoUrl: publicUrl,
      source: 'local_disk',
    });
  } catch (error: any) {
    console.error('Error saat upload foto:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan berkas foto ke disk lokal.' },
      { status: 500 }
    );
  }
}
