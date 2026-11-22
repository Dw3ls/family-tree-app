import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

function checkAdminAuth(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('Authorization')?.replace('Bearer ', '');
  return verifyAdminToken(cookieToken || headerToken);
}

// POST /api/upload - Menyimpan berkas foto profil secara fisik di public/uploads/
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

    // Validasi format file gambar
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validMimeTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Format berkas tidak didukung. Harap unggah berkas gambar (JPG, PNG, atau WEBP).' },
        { status: 400 }
      );
    }

    // Validasi ukuran berkas (maksimal 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Ukuran foto maksimal adalah 5MB.' },
        { status: 400 }
      );
    }

    // Coba simpan ke disk fisik jika filesystem writable (Lokal / VPS)
    try {
      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const rawExt = file.name.split('.').pop() || 'jpg';
      const cleanExt = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${cleanExt}`;
      const filePath = path.resolve(uploadsDir, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        success: true,
        photoUrl: publicUrl,
        fileName,
        source: 'local_disk',
      });
    } catch (fsError: any) {
      // Fallback untuk lingkungan Serverless / Vercel (read-only filesystem)
      // Konversi menjadi Data URL Base64 yang tersimpan langsung di Turso Cloud / SQLite
      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType = file.type || 'image/jpeg';
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      return NextResponse.json({
        success: true,
        photoUrl: dataUrl,
        fileName: file.name,
        source: 'serverless_base64',
      });
    }
  } catch (error: any) {
    console.error('Error saat upload foto profil:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memproses berkas foto.' },
      { status: 500 }
    );
  }
}
