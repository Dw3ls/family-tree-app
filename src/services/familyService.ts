import { FamilyMember } from '../types/family';
import { INITIAL_FAMILY_MEMBERS } from '../data/initialFamilyData';

const LOCAL_STORAGE_KEY = 'family_tree_members_v2_id';
const ADMIN_STORAGE_KEY = 'family_admin_session_token';

export const familyService = {
  // Mendapatkan token admin lokal
  getAdminToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_STORAGE_KEY);
  },

  // Menyimpan token admin lokal
  setAdminToken: (token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(ADMIN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  },

  // 1. Mengambil seluruh data anggota keluarga (GET /api/members)
  getMembers: async (): Promise<{ members: FamilyMember[]; source: string }> => {
    try {
      const res = await fetch('/api/members', {
        method: 'GET',
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        // Selalu prioritaskan data dari server, bahkan jika array kosong []
        if (json.success && Array.isArray(json.data)) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          }
          return { members: json.data, source: json.source || 'api' };
        }
      }
    } catch (e) {
      console.warn('Gagal memanggil API backend, beralih ke cache lokal:', e);
    }

    // Fallback cadangan dari localStorage hanya jika koneksi ke server gagal total
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return { members: parsed, source: 'local_cache' };
          }
        }
      } catch (err) {
        console.warn('Gagal membaca cache lokal:', err);
      }
    }

    return { members: [], source: 'empty' };
  },

  // 2. Menambah anggota keluarga baru (POST /api/members)
  createMember: async (member: FamilyMember): Promise<FamilyMember> => {
    const token = familyService.getAdminToken();

    const res = await fetch('/api/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(member),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal menyimpan anggota ke server (${res.status})`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Respons server tidak valid.');
    }

    // Sinkronkan cache lokal
    if (typeof window !== 'undefined') {
      try {
        const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...current, json.data]));
      } catch (e) {}
    }

    return json.data;
  },

  // 3. Memperbarui profil anggota (PUT /api/members/[id])
  updateMember: async (id: string, updates: Partial<FamilyMember>): Promise<FamilyMember> => {
    const token = familyService.getAdminToken();

    const res = await fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal memperbarui anggota (${res.status})`);
    }

    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Respons server tidak valid.');
    }

    // Sinkronkan cache lokal
    if (typeof window !== 'undefined') {
      try {
        const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const updated = current.map((m: any) => (m.id === id ? json.data : m));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
    }

    return json.data;
  },

  // 4. Menghapus anggota (DELETE /api/members/[id])
  deleteMember: async (id: string): Promise<boolean> => {
    const token = familyService.getAdminToken();

    const res = await fetch(`/api/members/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Gagal menghapus anggota (${res.status})`);
    }

    const json = await res.json();

    // Sinkronkan cache lokal
    if (typeof window !== 'undefined') {
      try {
        const current = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const filtered = current.filter((m: any) => m.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {}
    }

    return Boolean(json.success);
  },

  // 5. Mengatur ulang ke data demo (POST /api/members/seed)
  resetToDemo: async (): Promise<FamilyMember[]> => {
    const token = familyService.getAdminToken();

    try {
      const res = await fetch('/api/members/seed', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.data));
          }
          return json.data;
        }
      }
    } catch (e) {
      console.warn('API error saat resetToDemo:', e);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    return INITIAL_FAMILY_MEMBERS;
  },

  // 6. Login Admin (POST /api/auth/login)
  loginAdmin: async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.token) {
          familyService.setAdminToken(json.token);
          return true;
        }
      }
    } catch (e) {
      console.warn('API error saat loginAdmin:', e);
    }

    return false;
  },

  // 7. Logout Admin (POST /api/auth/logout)
  logoutAdmin: async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignored
    }
    familyService.setAdminToken(null);
  },

  // 8. Cek Status Sesi Admin (GET /api/auth/check)
  checkAdminStatus: async (): Promise<boolean> => {
    const token = familyService.getAdminToken();
    try {
      const res = await fetch('/api/auth/check', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        return Boolean(json.isAdmin);
      }
    } catch (e) {
      // Ignored
    }
    return Boolean(token);
  },

  // 9. Unggah Foto Profil (POST /api/upload)
  uploadAvatar: async (file: File): Promise<string | null> => {
    const token = familyService.getAdminToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.photoUrl) {
          return json.photoUrl;
        }
      }
    } catch (e) {
      console.warn('API error saat uploadAvatar:', e);
    }

    return null;
  },
};
