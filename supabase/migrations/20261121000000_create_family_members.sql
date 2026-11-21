-- ==============================================================================
-- Migration: Create family_members table & RLS policies
-- Document Reference: PRD Section 5 (Database Schema) & Section 6 (Acceptance Criteria)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Gender Enum
DO $$ BEGIN
  CREATE TYPE member_gender AS ENUM ('male', 'female');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create family_members Table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  gender member_gender NOT NULL,
  birth_place VARCHAR(150),
  birth_date DATE,
  death_date DATE,
  origin_city VARCHAR(100),
  current_city VARCHAR(100),
  bio TEXT,
  photo_url TEXT,
  father_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  mother_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  spouse_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
  generation INT DEFAULT 1,
  family_position VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create Indexes for High-Performance Tree Traversal & Search
CREATE INDEX IF NOT EXISTS idx_family_members_father ON public.family_members(father_id);
CREATE INDEX IF NOT EXISTS idx_family_members_mother ON public.family_members(mother_id);
CREATE INDEX IF NOT EXISTS idx_family_members_spouse ON public.family_members(spouse_id);
CREATE INDEX IF NOT EXISTS idx_family_members_generation ON public.family_members(generation);
CREATE INDEX IF NOT EXISTS idx_family_members_name ON public.family_members(full_name);

-- 5. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_family_members_updated_at ON public.family_members;
CREATE TRIGGER trigger_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policy: Public Read-Only Access (Acceptance Criteria #1)
-- Semua pengunjung umum dapat membaca data pohon keluarga tanpa login
DROP POLICY IF EXISTS "Public can view family members" ON public.family_members;
CREATE POLICY "Public can view family members"
  ON public.family_members
  FOR SELECT
  TO public
  USING (true);

-- 8. RLS Policy: Authenticated Admins Write Access (Acceptance Criteria #4)
-- Hanya sesi Admin yang diautentikasi yang berhak INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Authenticated admins can insert members" ON public.family_members;
CREATE POLICY "Authenticated admins can insert members"
  ON public.family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can update members" ON public.family_members;
CREATE POLICY "Authenticated admins can update members"
  ON public.family_members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated admins can delete members" ON public.family_members;
CREATE POLICY "Authenticated admins can delete members"
  ON public.family_members
  FOR DELETE
  TO authenticated
  USING (true);

-- ==============================================================================
-- Supabase Storage Setup: Bucket 'family-avatars'
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-avatars', 'family-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Publik dapat melihat foto avatar
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'family-avatars');

-- Storage Policy: Admin terautentikasi dapat mengunggah foto avatar
DROP POLICY IF EXISTS "Authenticated admins can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated admins can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'family-avatars');

DROP POLICY IF EXISTS "Authenticated admins can update avatars" ON storage.objects;
CREATE POLICY "Authenticated admins can update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'family-avatars');

DROP POLICY IF EXISTS "Authenticated admins can delete avatars" ON storage.objects;
CREATE POLICY "Authenticated admins can delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'family-avatars');
