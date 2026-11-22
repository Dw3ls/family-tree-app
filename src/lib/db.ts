import fs from 'fs';
import path from 'path';
import { createClient, Client } from '@libsql/client';
import { FamilyMember } from '../types/family';

let clientInstance: Client | null = null;

function getDbClient(): Client {
  if (clientInstance) return clientInstance;

  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.resolve(dataDir, 'family.db');
  clientInstance = createClient({
    url: `file:${dbPath}`,
  });

  return clientInstance;
}

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  const client = getDbClient();

  // 1. Buat Tabel Silsilah Keluarga Lokal Tanpa Data Dummy Bawaan
  await client.execute(`
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      nickname TEXT,
      gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
      birth_place TEXT,
      birth_date TEXT,
      death_date TEXT,
      origin_city TEXT,
      current_city TEXT,
      bio TEXT,
      photo_url TEXT,
      father_id TEXT,
      mother_id TEXT,
      spouse_id TEXT,
      generation INTEGER DEFAULT 1,
      family_position TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Buat Indeks Pencarian & Traversal Silsilah
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_father ON family_members(father_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_mother ON family_members(mother_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_spouse ON family_members(spouse_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_generation ON family_members(generation);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_name ON family_members(full_name);`);

  isInitialized = true;
}

function mapRowToMember(row: any): FamilyMember {
  return {
    id: String(row.id),
    full_name: String(row.full_name),
    nickname: row.nickname ? String(row.nickname) : undefined,
    gender: row.gender as 'male' | 'female',
    birth_place: row.birth_place ? String(row.birth_place) : undefined,
    birth_date: row.birth_date ? String(row.birth_date) : undefined,
    death_date: row.death_date ? String(row.death_date) : undefined,
    origin_city: row.origin_city ? String(row.origin_city) : undefined,
    current_city: row.current_city ? String(row.current_city) : undefined,
    bio: row.bio ? String(row.bio) : undefined,
    photo_url: row.photo_url ? String(row.photo_url) : undefined,
    father_id: row.father_id ? String(row.father_id) : null,
    mother_id: row.mother_id ? String(row.mother_id) : null,
    spouse_id: row.spouse_id ? String(row.spouse_id) : null,
    generation: Number(row.generation) || 1,
    family_position: row.family_position ? String(row.family_position) : undefined,
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export const localDb = {
  // Ambil semua anggota keluarga dari SQLite lokal
  getAllMembers: async (): Promise<FamilyMember[]> => {
    await initDb();
    const client = getDbClient();
    const rs = await client.execute(`
      SELECT * FROM family_members 
      ORDER BY generation ASC, birth_date ASC;
    `);
    return rs.rows.map(mapRowToMember);
  },

  // Ambil satu anggota berdasarkan ID
  getMemberById: async (id: string): Promise<FamilyMember | null> => {
    await initDb();
    const client = getDbClient();
    const rs = await client.execute({
      sql: `SELECT * FROM family_members WHERE id = ? LIMIT 1;`,
      args: [id],
    });
    if (rs.rows.length === 0) return null;
    return mapRowToMember(rs.rows[0]);
  },

  // Tambah anggota baru ke SQLite lokal
  createMember: async (member: FamilyMember): Promise<FamilyMember> => {
    await initDb();
    const client = getDbClient();
    const now = new Date().toISOString();

    await client.execute({
      sql: `
        INSERT OR REPLACE INTO family_members (
          id, full_name, nickname, gender, birth_place, birth_date, death_date,
          origin_city, current_city, bio, photo_url, father_id, mother_id, spouse_id,
          generation, family_position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        member.id,
        member.full_name,
        member.nickname || null,
        member.gender,
        member.birth_place || null,
        member.birth_date || null,
        member.death_date || null,
        member.origin_city || null,
        member.current_city || null,
        member.bio || null,
        member.photo_url || null,
        member.father_id || null,
        member.mother_id || null,
        member.spouse_id || null,
        member.generation || 1,
        member.family_position || null,
        now,
        now,
      ],
    });

    return { ...member, created_at: now, updated_at: now };
  },

  // Ubah profil anggota di SQLite lokal
  updateMember: async (id: string, updates: Partial<FamilyMember>): Promise<FamilyMember | null> => {
    await initDb();
    const client = getDbClient();
    const existing = await localDb.getMemberById(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };

    await client.execute({
      sql: `
        UPDATE family_members SET
          full_name = ?,
          nickname = ?,
          gender = ?,
          birth_place = ?,
          birth_date = ?,
          death_date = ?,
          origin_city = ?,
          current_city = ?,
          bio = ?,
          photo_url = ?,
          father_id = ?,
          mother_id = ?,
          spouse_id = ?,
          generation = ?,
          family_position = ?,
          updated_at = ?
        WHERE id = ?;
      `,
      args: [
        merged.full_name,
        merged.nickname || null,
        merged.gender,
        merged.birth_place || null,
        merged.birth_date || null,
        merged.death_date || null,
        merged.origin_city || null,
        merged.current_city || null,
        merged.bio || null,
        merged.photo_url || null,
        merged.father_id || null,
        merged.mother_id || null,
        merged.spouse_id || null,
        merged.generation || 1,
        merged.family_position || null,
        merged.updated_at,
        id,
      ],
    });

    return merged;
  },

  // Hapus anggota & bersihkan referensi relasi
  deleteMember: async (id: string): Promise<boolean> => {
    await initDb();
    const client = getDbClient();

    // Bersihkan referensi foreign key
    await client.execute({
      sql: `UPDATE family_members SET father_id = NULL WHERE father_id = ?;`,
      args: [id],
    });
    await client.execute({
      sql: `UPDATE family_members SET mother_id = NULL WHERE mother_id = ?;`,
      args: [id],
    });
    await client.execute({
      sql: `UPDATE family_members SET spouse_id = NULL WHERE spouse_id = ?;`,
      args: [id],
    });

    const rs = await client.execute({
      sql: `DELETE FROM family_members WHERE id = ?;`,
      args: [id],
    });

    return rs.rowsAffected > 0;
  },

  // Kosongkan seluruh data silsilah
  clearAllMembers: async (): Promise<boolean> => {
    await initDb();
    const client = getDbClient();
    await client.execute(`DELETE FROM family_members;`);
    return true;
  },

  // Impor sekumpulan data silsilah keluarga (misal dari backup JSON)
  importMembers: async (members: FamilyMember[]): Promise<FamilyMember[]> => {
    await initDb();
    const client = getDbClient();

    // Kosongkan dahulu
    await client.execute(`DELETE FROM family_members;`);

    const now = new Date().toISOString();
    for (const m of members) {
      await client.execute({
        sql: `
          INSERT OR REPLACE INTO family_members (
            id, full_name, nickname, gender, birth_place, birth_date, death_date,
            origin_city, current_city, bio, photo_url, father_id, mother_id, spouse_id,
            generation, family_position, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        args: [
          m.id || `member-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          m.full_name,
          m.nickname || null,
          m.gender,
          m.birth_place || null,
          m.birth_date || null,
          m.death_date || null,
          m.origin_city || null,
          m.current_city || null,
          m.bio || null,
          m.photo_url || null,
          m.father_id || null,
          m.mother_id || null,
          m.spouse_id || null,
          m.generation || 1,
          m.family_position || null,
          now,
          now,
        ],
      });
    }

    return localDb.getAllMembers();
  },
};
