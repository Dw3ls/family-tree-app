-- ==============================================================================
-- Seed Data: Silsilah 4 Generasi Keluarga Besar Soedirdjo
-- ==============================================================================

-- Bersihkan data sebelumnya (opsional untuk seeding bersih)
TRUNCATE TABLE public.family_members CASCADE;

-- Masukkan Generasi 1: Eyang Soedirdjo & Eyang Putri Siti Rahayu
INSERT INTO public.family_members (
  id, full_name, nickname, gender, birth_place, birth_date, death_date, origin_city, current_city, bio, photo_url, generation, family_position
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Raden Soedirdjo Brotowardoyo',
  'Eyang Kakung Dirjo',
  'male',
  'Yogyakarta',
  '1936-05-18',
  '2017-09-12',
  'Yogyakarta',
  'Yogyakarta',
  'Pendiri garis keturunan keluarga besar. Sosok pejuang kemandirian yang merintis sanggar kerajinan kayu dan batik tulis di Kotagede. Gemar menceritakan falsafah wayang dan tembang Jawa kepada anak cucu.',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  1,
  'Kepala Keluarga Generasi ke-1'
),
(
  '00000000-0000-0000-0000-000000000002',
  'Siti Rahayu Soedirdjo',
  'Eyang Putri Rahayu',
  'female',
  'Surakarta, Jawa Tengah',
  '1940-08-25',
  NULL,
  'Surakarta',
  'Yogyakarta',
  'Pendidik budi pekerti dan penjaga tradisi pusaka kuliner keluarga. Rumah joglo beliau senantiasa menjadi titik temu hangat bagi seluruh keturunan di hari raya dan peringatan keluarga.',
  'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
  1,
  'Ibu Keturunan Generasi ke-1'
);

-- Hubungkan pernikahan Eyang Soedirdjo & Siti Rahayu
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000002' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000001' WHERE id = '00000000-0000-0000-0000-000000000002';

-- Masukkan Generasi 2: Anak-anak Eyang Soedirdjo & Menantu
INSERT INTO public.family_members (
  id, full_name, nickname, gender, birth_place, birth_date, death_date, origin_city, current_city, bio, photo_url, father_id, mother_id, generation, family_position
) VALUES
(
  '00000000-0000-0000-0000-000000000003',
  'Ir. Bambang Trihatmojo Soedirdjo',
  'Pakdhe Bambang',
  'male',
  'Yogyakarta',
  '1964-03-14',
  NULL,
  'Yogyakarta',
  'Jakarta Selatan',
  'Anak sulung dari Raden Soedirdjo & Siti Rahayu. Berprofesi sebagai arsitek lansekap tata kota. Senang berkebun tanaman hias langka dan membimbing adik-adiknya dalam berbagai urusan keluarga.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  2,
  'Anak ke-1 dari Soedirdjo & Siti Rahayu'
),
(
  '00000000-0000-0000-0000-000000000004',
  'dr. Dewi Anggraini, Sp.A',
  'Budhe Dewi',
  'female',
  'Bandung, Jawa Barat',
  '1966-11-20',
  NULL,
  'Bandung',
  'Jakarta Selatan',
  'Dokter spesialis anak di rumah sakit pusat Jakarta. Menikah dengan Bambang pada tahun 1991. Dikenal ramah, gemar memasak masakan Sunda, serta aktif dalam kegiatan sosial kesehatan.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  NULL,
  NULL,
  2,
  'Istri dari Bambang Trihatmojo'
),
(
  '00000000-0000-0000-0000-000000000005',
  'Dra. Retno Wulandari, M.Hum',
  'Budhe Retno',
  'female',
  'Yogyakarta',
  '1968-07-09',
  NULL,
  'Yogyakarta',
  'Surabaya, Jawa Timur',
  'Anak ke-2 dari Raden Soedirdjo & Siti Rahayu. Guru besar sastra dan kebudayaan daerah di Surabaya. Pengarsip utama silsilah garis keturunan dan dokumen bersejarah keluarga besar.',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  2,
  'Anak ke-2 dari Soedirdjo & Siti Rahayu'
),
(
  '00000000-0000-0000-0000-000000000006',
  'Hendro Prasetyo, S.E., M.M.',
  'Pakdhe Hendro',
  'male',
  'Surabaya, Jawa Timur',
  '1965-12-04',
  NULL,
  'Surabaya',
  'Surabaya, Jawa Timur',
  'Konsultan manajemen dan logistik pelabuhan. Menikah dengan Retno pada tahun 1995. Penggemar olahraga bulu tangkis dan musik keroncong.',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  NULL,
  NULL,
  2,
  'Suami dari Retno Wulandari'
),
(
  '00000000-0000-0000-0000-000000000007',
  'Agus Gunawan Soedirdjo',
  'Om Agus',
  'male',
  'Surakarta, Jawa Tengah',
  '1974-09-17',
  NULL,
  'Surakarta',
  'Denpasar, Bali',
  'Anak ke-3 dari Raden Soedirdjo & Siti Rahayu. Fotografer dokumenter satwa liar dan pecinta alam. Sering berkelana ke pelosok Indonesia untuk pameran fotografi kelestarian alam.',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  2,
  'Anak ke-3 dari Soedirdjo & Siti Rahayu'
);

-- Pasangkan pernikahan Gen 2
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000004' WHERE id = '00000000-0000-0000-0000-000000000003';
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000003' WHERE id = '00000000-0000-0000-0000-000000000004';

UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000006' WHERE id = '00000000-0000-0000-0000-000000000005';
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000005' WHERE id = '00000000-0000-0000-0000-000000000006';

-- Masukkan Generasi 3: Cucu-cucu
INSERT INTO public.family_members (
  id, full_name, nickname, gender, birth_place, birth_date, death_date, origin_city, current_city, bio, photo_url, father_id, mother_id, generation, family_position
) VALUES
(
  '00000000-0000-0000-0000-000000000008',
  'Dimas Arya Pratama, S.T.',
  'Mas Dimas',
  'male',
  'Jakarta',
  '1993-04-12',
  NULL,
  'Jakarta',
  'Bandung, Jawa Barat',
  'Anak sulung Bambang & Dewi. Software Engineer yang berfokus pada teknologi antarmuka dan kecerdasan buatan. Menyukai kopi manual brew dan bersepeda jarak jauh.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  3,
  'Anak ke-1 dari Bambang & Dewi'
),
(
  '00000000-0000-0000-0000-000000000009',
  'Nadia Safira, S.Ds.',
  'Mbak Nadia',
  'female',
  'Bandung, Jawa Barat',
  '1995-07-28',
  NULL,
  'Bandung',
  'Bandung, Jawa Barat',
  'Desainer kriya keramik kontemporer. Menikah dengan Dimas pada tahun 2021. Karyanya telah dipamerkan di berbagai galeri seni rupa di Bandung dan Jakarta.',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  NULL,
  NULL,
  3,
  'Istri dari Dimas Arya Pratama'
),
(
  '00000000-0000-0000-0000-000000000010',
  'Anisa Maharani, S.Si.',
  'Mbak Nisa',
  'female',
  'Jakarta',
  '1998-02-15',
  NULL,
  'Jakarta',
  'Jakarta Selatan',
  'Anak ke-2 Bambang & Dewi. Peneliti bioteknologi pangan pada balai riset nasional. Aktif dalam program pendampingan pertanian ramah lingkungan.',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  3,
  'Anak ke-2 dari Bambang & Dewi'
),
(
  '00000000-0000-0000-0000-000000000011',
  'Fajar Nugroho Prasetyo, S.Ars.',
  'Mas Fajar',
  'male',
  'Surabaya, Jawa Timur',
  '1997-01-20',
  NULL,
  'Surabaya',
  'Yogyakarta',
  'Anak sulung Retno & Hendro. Arsitek restorasi bangunan cagar budaya heritage di Yogyakarta. Menghidupkan kembali rancang bangun arsitektur nusantara warisan Eyang Kakung.',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000005',
  3,
  'Anak ke-1 dari Hendro & Retno'
),
(
  '00000000-0000-0000-0000-000000000012',
  'Clarissa Putri Prasetyo, S.I.Kom.',
  'Mbak Rissa',
  'female',
  'Surabaya, Jawa Timur',
  '2001-06-11',
  NULL,
  'Surabaya',
  'Malang, Jawa Timur',
  'Anak ke-2 Retno & Hendro. Bekerja sebagai spesialis komunikasi korporasi dan edukasi lingkungan hidup. Menikah dengan Reza Maulana pada tahun 2024.',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000005',
  3,
  'Anak ke-2 dari Hendro & Retno'
),
(
  '00000000-0000-0000-0000-000000000013',
  'Reza Maulana, M.Kom.',
  'Mas Reza',
  'male',
  'Malang, Jawa Timur',
  '1999-08-30',
  NULL,
  'Malang',
  'Malang, Jawa Timur',
  'Data scientist dan pegiat platform edukasi digital di Jawa Timur. Hobi mendaki gunung dan menyusun analisis data silsilah digital.',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  NULL,
  NULL,
  3,
  'Suami dari Clarissa Putri Prasetyo'
);

-- Pasangkan pernikahan Gen 3
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000009' WHERE id = '00000000-0000-0000-0000-000000000008';
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000008' WHERE id = '00000000-0000-0000-0000-000000000009';

UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000013' WHERE id = '00000000-0000-0000-0000-000000000012';
UPDATE public.family_members SET spouse_id = '00000000-0000-0000-0000-000000000012' WHERE id = '00000000-0000-0000-0000-000000000013';

-- Masukkan Generasi 4: Cicit-cicit
INSERT INTO public.family_members (
  id, full_name, nickname, gender, birth_place, birth_date, death_date, origin_city, current_city, bio, photo_url, father_id, mother_id, generation, family_position
) VALUES
(
  '00000000-0000-0000-0000-000000000014',
  'Kenzo Arka Soedirdjo',
  'Kenzo',
  'male',
  'Bandung, Jawa Barat',
  '2023-10-05',
  NULL,
  'Bandung',
  'Bandung, Jawa Barat',
  'Cicit pertama di keluarga besar Soedirdjo. Buah hati dari Dimas & Nadia. Sangat aktif, gemar menggambar warna-warni, dan menjadi kesayangan seluruh keluarga.',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000009',
  4,
  'Cicit pertama (Anak Dimas & Nadia)'
),
(
  '00000000-0000-0000-0000-000000000015',
  'Alana Kirana Maulana',
  'Alana',
  'female',
  'Malang, Jawa Timur',
  '2025-01-18',
  NULL,
  'Malang',
  'Malang, Jawa Timur',
  'Anggota keluarga termuda yang membawa keceriaan baru. Putri manis dari Clarissa & Reza, generasi penerus masa depan keluarga.',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000012',
  4,
  'Cicit kedua (Anak Reza & Clarissa)'
);
