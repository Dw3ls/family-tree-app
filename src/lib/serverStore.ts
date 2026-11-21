import { FamilyMember } from '../types/family';
import { INITIAL_FAMILY_MEMBERS } from '../data/initialFamilyData';

// Penyimpanan data di tingkat server jika Supabase belum dikonfigurasi
let inMemoryMembers: FamilyMember[] = [...INITIAL_FAMILY_MEMBERS];

export const serverStore = {
  getAll: (): FamilyMember[] => {
    return inMemoryMembers;
  },

  getById: (id: string): FamilyMember | null => {
    return inMemoryMembers.find((m) => m.id === id) || null;
  },

  insert: (member: FamilyMember): FamilyMember => {
    inMemoryMembers.push(member);
    return member;
  },

  update: (id: string, updates: Partial<FamilyMember>): FamilyMember | null => {
    const index = inMemoryMembers.findIndex((m) => m.id === id);
    if (index === -1) return null;

    inMemoryMembers[index] = {
      ...inMemoryMembers[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return inMemoryMembers[index];
  },

  delete: (id: string): boolean => {
    const exists = inMemoryMembers.some((m) => m.id === id);
    if (!exists) return false;

    // Bersihkan referensi foreign key di relasi lain
    inMemoryMembers = inMemoryMembers
      .filter((m) => m.id !== id)
      .map((m) => ({
        ...m,
        father_id: m.father_id === id ? null : m.father_id,
        mother_id: m.mother_id === id ? null : m.mother_id,
        spouse_id: m.spouse_id === id ? null : m.spouse_id,
      }));

    return true;
  },

  reset: (): FamilyMember[] => {
    inMemoryMembers = [...INITIAL_FAMILY_MEMBERS];
    return inMemoryMembers;
  },
};
