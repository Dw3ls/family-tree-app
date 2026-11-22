export type Gender = 'male' | 'female';

export interface FamilyMember {
  id: string;
  full_name: string;
  nickname?: string;
  gender: Gender;
  birth_place?: string;
  birth_date?: string; // YYYY-MM-DD or YYYY
  death_date?: string; // YYYY-MM-DD or YYYY (optional)
  origin_city?: string;
  current_city?: string;
  bio?: string;
  photo_url?: string;
  father_id?: string | null;
  mother_id?: string | null;
  spouse_id?: string | null;
  generation?: number;
  family_position?: string;
  custom_x?: number;
  custom_y?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RelationshipStep {
  fromId: string;
  toId: string;
  relationship: string;
  detail: string;
}

export interface RelationshipResult {
  personAId: string;
  personBId: string;
  title: string;
  description: string;
  path: string[]; // sequence of member IDs connecting A to B
  steps: RelationshipStep[];
  commonAncestorId?: string;
}
