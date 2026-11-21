'use client';

import React, { useState, useRef } from 'react';
import { FamilyMember, Gender } from '../types/family';
import { familyService } from '../services/familyService';
import { X, Save, Trash2, Link as LinkIcon, UserPlus, Upload, Loader2 } from 'lucide-react';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  allMembers: FamilyMember[];
  onSave: (savedMember: FamilyMember) => void;
  onDelete?: (memberId: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=400&q=80',
];

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  allMembers,
  onSave,
  onDelete,
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
  const [photoUrl, setPhotoUrl] = useState(member?.photo_url || AVATAR_PRESETS[0]);
  const [fatherId, setFatherId] = useState<string | null>(member?.father_id || null);
  const [motherId, setMotherId] = useState<string | null>(member?.mother_id || null);
  const [spouseId, setSpouseId] = useState<string | null>(member?.spouse_id || null);
  const [generation, setGeneration] = useState<number>(member?.generation || 2);
  const [familyPosition, setFamilyPosition] = useState(member?.family_position || '');
  const [isUploading, setIsUploading] = useState(false);

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
      setPhotoUrl(member.photo_url || AVATAR_PRESETS[0]);
      setFatherId(member.father_id || null);
      setMotherId(member.mother_id || null);
      setSpouseId(member.spouse_id || null);
      setGeneration(member.generation || 2);
      setFamilyPosition(member.family_position || '');
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
      setPhotoUrl(AVATAR_PRESETS[0]);
      setFatherId(null);
      setMotherId(null);
      setSpouseId(null);
      setGeneration(2);
      setFamilyPosition('');
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const potentialFathers = allMembers.filter(
    (m) => m.id !== member?.id && m.gender === 'male'
  );
  const potentialMothers = allMembers.filter(
    (m) => m.id !== member?.id && m.gender === 'female'
  );
  const potentialSpouses = allMembers.filter((m) => m.id !== member?.id);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedUrl = await familyService.uploadAvatar(file);
      if (uploadedUrl) {
        setPhotoUrl(uploadedUrl);
      } else {
        alert('Gagal mengunggah foto. Pastikan format berupa gambar (JPG/PNG).');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat mengunggah foto.');
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
          {/* Pratinjau Foto Profil & Unggah */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-darkorange-700 shadow-soft-sm shrink-0 bg-zinc-100">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Pratinjau foto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 text-xs">
                  Foto
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-zinc-700">
                  Foto Profil (Unggah dari Komputer atau Pilih Contoh):
                </label>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  <Upload className="w-3 h-3 text-darkorange-400" />
                  Unggah Berkas
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://... atau data gambar"
                className="w-full text-xs px-3 py-1.5 border border-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-900 outline-none mb-2"
              />
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(preset)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 transition ${
                      photoUrl === preset ? 'border-darkorange-700 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
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
                Tingkat Generasi (1, 2, 3, 4)
              </label>
              <input
                type="number"
                min="1"
                max="6"
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
                Simpan Anggota
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
