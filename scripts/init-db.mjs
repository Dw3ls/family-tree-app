import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'family.db');
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
}

const client = createClient({
  url: `file:${dbPath}`,
});

const seedData = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'scripts', 'seed-data.json'), 'utf8')
);

async function main() {
  console.log('1. Creating SQLite schema in:', dbPath);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      nickname TEXT,
      gender TEXT NOT NULL,
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

  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_father ON family_members(father_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_mother ON family_members(mother_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_spouse ON family_members(spouse_id);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_generation ON family_members(generation);`);
  await client.execute(`CREATE INDEX IF NOT EXISTS idx_members_name ON family_members(full_name);`);

  console.log('2. Inserting initial members...');
  const now = new Date().toISOString();
  for (const m of seedData) {
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO family_members (
          id, full_name, nickname, gender, birth_place, birth_date, death_date,
          origin_city, current_city, bio, photo_url, father_id, mother_id, spouse_id,
          generation, family_position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      args: [
        m.id,
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

  const count = await client.execute(`SELECT COUNT(*) as c FROM family_members;`);
  console.log('3. SQLite Seed Completed! Total Rows:', count.rows[0].c);
}

main().catch(console.error);
