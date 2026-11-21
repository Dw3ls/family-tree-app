# Aplikasi Silsilah Pohon Keluarga Interaktif

Aplikasi web interaktif untuk memvisualisasikan silsilah garis keturunan keluarga besar lintas generasi dengan kalkulasi hubungan kekerabatan otomatis dan **database lokal SQLite bawaan**, berlandaskan spesifikasi dokumen [prd.md](file:///d:/project/antigravity/family/prd.md).

---

## 🗄️ Database Lokal (SQLite)
Aplikasi ini menggunakan **SQLite lokal** (`data/family.db`) sehingga berjalan 100% mandiri (*self-contained*):
- **Zero Configuration:** Tidak memerlukan instalasi software server database terpisah (bebas instalasi PostgreSQL/MySQL/Docker).
- **File Database Lokal:** Berkas database disimpan langsung di `data/family.db`.
- **Relasi & Indeks SQL:** Mendukung query SQL relasional berkinerja tinggi, indeks traversal silsilah keluarga, dan proteksi integritas data.
- **Penyimpanan Foto Lokal:** Unggahan foto profil langsung disimpan di direktori lokal `public/uploads/`.
- **Script Inisialisasi & Reset Data:**
  ```bash
  node scripts/init-db.mjs
  ```

---

## 🎨 Tema Desain & Palet Warna
- **Abu-abu (Zinc / Slate):** Warna latar belakang kanvas, kartu informasi, batas kontur yang tegas dan minimalis.
- **Hitam Pekat (Charcoal / Black `#09090b` & `#18181b`):** Header atas, kartu statistik, bingkai avatar, dan tombol aksi tegas.
- **Putih Bersih (`#ffffff`):** Latar belakang kartu profil anggota, drawer detail, dan kanvas utama.
- **Orange Gelap (`#c2410c` & `#ea580c`):** Aksen penanda aktif, jalur hubungan silsilah yang disorot, ikon interaktif, dan tombol utama.
- **Tipografi Terpadu:** Menggunakan font modern **Plus Jakarta Sans** di seluruh halaman.

---

## 🌟 Fitur Utama

### 1. Kanvas Pohon Silsilah Interaktif (PRD Bagian 3.A)
- **Node Profil Sirkuler:** Bingkai foto sirkuler dengan indikator gender, status kehidupan (Masih Hidup / Wafat), nama lengkap, nama panggilan, rentang tahun, dan domisili.
- **Garis Konektor Ortogonal:**
  - **Pernikahan:** Garis horizontal berlabel `⚭`.
  - **Garis Keturunan:** Garis ortogonal vertikal halus yang mengalir ke anak-anak berpanah `↓`.
- **Kontrol Navigasi:** Geser bebas (*pan*), perbesar/perkecil (*zoom*), peta mini (*minimap*), dan tombol **"Pusatkan Tampilan"**.
- **Filter Generasi:** Tab tombol untuk menampilkan atau memfilter tampilan berdasarkan Generasi (Semua, Gen 1, Gen 2, Gen 3, Gen 4).

### 2. Panel Rincian Profil Anggota (Drawer) (PRD Bagian 3.B)
- Klik anggota keluarga mana saja untuk membuka drawer rincian:
  - Foto resolusi tinggi dan status kehidupan.
  - Nama lengkap, nama panggilan, tempat & tanggal lahir, tanggal wafat.
  - Kota asal & domisili saat ini.
  - Posisi keluarga (misal: *"Anak ke-1 dari Soedirdjo & Siti Rahayu"*).
  - Biografi dan catatan kisah keluarga.
  - **Tautan Cepat Kerabat:** Klik Ayah, Ibu, Pasangan, Anak, atau Saudara Kandung untuk langsung menggeser fokus kamera ke anggota tersebut.
  - Tombol pintas **"Cek Kekerabatan"**.

### 3. Penemu & Kalkulator Hubungan Kekerabatan (PRD Bagian 3.C)
- **Pemilih 2 Orang:** Pilih Orang A dan Orang B langsung dari kanvas atau lewat menu dropdown pencarian.
- **Mesin Algoritma Kekerabatan Graf:**
  - Menghitung sebutan kekerabatan yang akurat (*Ayah, Ibu, Anak, Kakek, Nenek, Cucu, Kakek Buyut, Cicit, Paman/Bibi, Keponakan, Saudara Sepupu, Saudara Ipar, Mertua, Menantu*).
  - Menampilkan rantai jalur silsilah langkah demi langkah (*breadcrumbs*).
  - **Sorotan Visual pada Kanvas:** Jalur antara Orang A dan Orang B menyala dengan aksen orange gelap, sementara cabang keluarga yang tidak terkait otomatis diredupkan.

### 4. Pencarian Cepat & Fokus Otomatis (PRD Bagian 3.D)
- Kolom pencarian di navigasi atas dengan pencarian langsung (*real-time auto-complete*).
- Menampilkan foto, nama, nama panggilan, dan kota.
- Memilih hasil pencarian akan langsung mengarahkan kamera kanvas ke posisi orang tersebut.

### 5. Pengelolaan Data Silsilah (Mode Admin) (PRD Bagian 3.E)
- **Keamanan:** Klik ikon gembok dan masukkan sandi demo `admin123`.
- **CRUD & Relasi:** Tambah anggota baru, ubah rincian profil, unggah foto dari komputer, dan hapus data langsung tersimpan ke SQLite lokal `data/family.db`.
- Dilengkapi tombol **"Pulihkan Data Asli"** untuk mereset ke data awal kapan saja.

---

## 🚀 Menjalankan Aplikasi
Aplikasi saat ini aktif berjalan di:
```
http://localhost:3000
```
Untuk menjalankan kembali di lain waktu:
```bash
npm run dev
# atau mode produksi:
npm run build && npm run start
```
