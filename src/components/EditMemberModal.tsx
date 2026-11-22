'use client';

import React, { useState, useRef } from 'react';
import { FamilyMember, Gender } from '../types/family';
import { familyService } from '../services/familyService';
import { X, Save, Trash2, Link as LinkIcon, UserPlus, Upload, Loader2, ImagePlus } from 'lucide-react';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  onSave: (savedMember: FamilyMember) => void;
  onDelete?: (memberId: string) => void;
  defaultGeneration?: number;
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  allMembers,
  onSave,
  onDelete,
  defaultGeneration = 1,
}) => {
  const isEditing = Boolean(member && member.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(member?.full_name || '');
  const [nickname, setNickname] = useState(member?.nickname || '');
  const [gender, setGender] = useState<Gender>(member?.gender || 'male');
  const [birthPlace, setBirthPlace] = useState(member?.birth_place || '');
  const [birthDate, setBirthDate] = useState(member?.birth_date || '');
  const [deathDate, setDeathDate] = useState(member?.death_date || '');
  const [originCity, setOriginCity] = useState(member?.origin_city || '');
  const [currentCity, setCurrentCity] = useState(member?.current_city || '');
  const [bio, setBio] = useState(member?.bio || '');
  const [photoUrl, setPhotoUrl] = useState(member?.photo_url || '');
  const [fatherId, setFatherId] = useState<string | null>(member?.father_id || null);
  const [motherId, setMotherId] = useState<string | null>(member?.mother_id || null);
  const [spouseId, setSpouseId] = useState<string | null>(member?.spouse_id || null);
  const [generation, setGeneration] = useState<number>(member?.generation || defaultGeneration);
  const [familyPosition, setFamilyPosition] = useState(member?.family_position || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  React.useEffect(() => {
    if (member) {
      setFullName(member.full_name);
      setNickname(member.nickname || '');
      setGender(member.gender);
      setBirthPlace(member.birth_place || '');
      setBirthDate(member.birth_date || '');
      setDeathDate(member.death_date || '');
      setOriginCity(member.origin_city || '');
      setCurrentCity(member.current_city || '');
      setBio(member.bio || '');
      setPhotoUrl(member.photo_url || '');
      setFatherId(member.father_id || null);
      setMotherId(member.mother_id || null);
      setSpouseId(member.spouse_id || null);
      setGeneration(member.generation || defaultGeneration);
      setFamilyPosition(member.family_position || '');
      setUploadError(null);
    } else {
      setFullName('');
      setNickname('');
      setGender('male');
      setBirthPlace('');
      setBirthDate('');
      setDeathDate('');
      setOriginCity('');
      setCurrentCity('');
      setBio('');
      setPhotoUrl('');
      setFatherId(null);
      setMotherId(null);
      setSpouseId(null);
      setGeneration(defaultGeneration);
      setFamilyPosition('');
      setUploadError(null);
    }
  }, [member, isOpen, defaultGeneration]);

  if (!isOpen) return null;

  const potentialFathers = allMembers.filter(
    (m) => m.id !== member?.id && m.gender === 'male'
  );
  const potentialMothers = allMembers.filter(
    (m) => m.id !== member?.id && m.gender === 'female'
  );
  const potentialSpouses = allMembers.filter((m) => m.id !== member?.id);

  // Kompresi foto sebelum diunggah agar hemat bandwidth dan penyimpanan
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxDim = 600;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(file);
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      const uploadedUrl = await familyService.uploadAvatar(compressed);
      if (uploadedUrl) {
        setPhotoUrl(uploadedUrl);
      } else {
        setUploadError('Gagal mengunggah foto. Pastikan format berupa gambar (JPG, PNG, atau WEBP) max 5MB.');
      }
    } catch (err) {
      setUploadError('Terjadi kesalahan saat memproses unggahan foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      alert('Silakan masukkan nama lengkap.');
      return;
    }

    const payload: FamilyMember = {
      id: member?.id || `member-${Date.now()}`,
      full_name: fullName.trim(),
      nickname: nickname.trim() || undefined,
      gender,
      birth_place: birthPlace.trim() || undefined,
      birth_date: birthDate || undefined,
      death_date: deathDate || undefined,
      origin_city: originCity.trim() || undefined,
      current_city: currentCity.trim() || undefined,
      bio: bio.trim() || undefined,
      photo_url: photoUrl.trim() || undefined,
      father_id: fatherId || null,
      mother_id: motherId || null,
      spouse_id: spouseId || null,
      generation: Number(generation) || 1,
      family_position: familyPosition.trim() || undefined,
      updated_at: new Date().toISOString(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Save className="w-5 h-5 text-darkorange-400" />
            ) : (
              <UserPlus className="w-5 h-5 text-darkorange-400" />
            )}
            <h3 className="font-bold text-sm sm:text-base">
              {isEditing ? `Ubah Data: ${member?.full_name}` : 'Tambah Anggota Keluarga Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Bagian Unggah Foto Profil (Langsung Tersimpan di SQLite / Disk Lokal) */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <label className="text-xs font-bold text-zinc-900 block mb-2">
              Foto Profil Anggota
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-darkorange-700 shadow-soft-sm shrink-0 bg-zinc-200">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl}
                    alt="Pratinjau foto profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 text-[11px] font-semibold gap-1">
                    <ImagePlus className="w-6 h-6 text-zinc-400" />
                    <span>Tanpa Foto</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                    <Loader2 className="w-6 h-6 animate-spin text-darkorange-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-soft-sm border border-zinc-800"
                  >
                    <Upload className="w-3.5 h-3.5 text-darkorange-400" />
                    <span>{photoUrl ? 'Ganti Foto dari Komputer' : 'Pilih Foto dari Komputer'}</span>
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition border border-zinc-200"
                    >
                      Hapus Foto
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Berkas foto akan otomatis disimpan ke direktori lokal <code className="bg-zinc-200 px-1 py-0.5 rounded font-mono text-zinc-800">public/uploads/</code> dan tautannya tersimpan di database SQLite lokal.
                </p>

                {uploadError && (
                  <p className="text-[11px] font-semibold text-red-600">
                    {uploadError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Info Dasar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="contoh: Raden Soedirdjo Brotowardoyo"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Nama Panggilan / Alias
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="contoh: Eyang Dirjo / Pakdhe Bambang"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Jenis Kelamin *
              </label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={() => setGender('male')}
                    className="accent-zinc-900"
                  />
                  <span>Laki-laki (♂)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={() => setGender('female')}
                    className="accent-zinc-900"
                  />
                  <span>Perempuan (♀)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tingkat Generasi (1 = Leluhur, 2, 3...)
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={generation}
                onChange={(e) => setGeneration(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          {/* Tanggal & Tempat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tanggal Lahir (YYYY-MM-DD atau Tahun)
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="1964-03-14"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tanggal Wafat (Kosongkan jika masih hidup)
              </label>
              <input
                type="text"
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                placeholder="2017-09-12"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tempat Lahir / Kota Asal
              </label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="contoh: Yogyakarta"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Domisili Saat Ini
              </label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                placeholder="contoh: Jakarta Selatan / Bandung"
                className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
          </div>

          {/* Hubungan Silsilah & Pernikahan */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-darkorange-700" />
              Garis Silsilah Keluarga & Pasangan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Ayah Kandung
                </label>
                <select
                  value={fatherId || ''}
                  onChange={(e) => setFatherId(e.target.value || null)}
                  className="w-full text-xs px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Ada / Leluhur Utama --</option>
                  {potentialFathers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Ibu Kandung
                </label>
                <select
                  value={motherId || ''}
                  onChange={(e) => setMotherId(e.target.value || null)}
                  className="w-full text-xs px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                >
                  <option value="">-- Tidak Ada / Leluhur Utama --</option>
                  {potentialMothers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Pasangan (Suami/Istri)
                </label>
                <select
                  value={spouseId || ''}
                  onChange={(e) => setSpouseId(e.target.value || null)}
                  className="w-full text-xs px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white"
                >
                  <option value="">-- Belum Menikah / Tidak Ada --</option>
                  {potentialSpouses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Biografi */}
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Biografi & Kisah Warisan Keluarga
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tuliskan riwayat hidup singkat, pekerjaan, atau cerita berkesan..."
              className="w-full text-xs p-3 border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none"
            />
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Yakin ingin menghapus data ${member?.full_name}?`)) {
                    onDelete(member!.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Anggota
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-darkorange-700 hover:bg-darkorange-800 text-white text-xs font-bold shadow-soft-sm flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Anggota Baru'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
