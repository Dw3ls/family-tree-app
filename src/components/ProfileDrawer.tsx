'use client';

import React from 'react';
import { FamilyMember } from '../types/family';
import {
  X,
  MapPin,
  Calendar,
  Heart,
  GitBranch,
  Pencil,
  Sparkles,
  Users,
  Compass,
  BookOpen,
} from 'lucide-react';

interface ProfileDrawerProps {
  member: FamilyMember | null;
  onClose: () => void;
  allMembers: FamilyMember[];
  onFocusMember: (memberId: string) => void;
  onStartRelationshipCheck: (memberAId: string) => void;
  onEditMember?: (member: FamilyMember) => void;
  isAdminMode?: boolean;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  member,
  onClose,
  allMembers,
  onFocusMember,
  onStartRelationshipCheck,
  onEditMember,
  isAdminMode,
}) => {
  if (!member) return null;

  const memberMap = new Map(allMembers.map((m) => [m.id, m]));
  const father = member.father_id ? memberMap.get(member.father_id) : null;
  const mother = member.mother_id ? memberMap.get(member.mother_id) : null;
  const spouse = member.spouse_id ? memberMap.get(member.spouse_id) : null;

  // Anak-anak
  const children = allMembers.filter(
    (m) => m.father_id === member.id || m.mother_id === member.id
  );

  // Saudara kandung
  const siblings = allMembers.filter((m) => {
    if (m.id === member.id) return false;
    const sameFather = member.father_id && m.father_id === member.father_id;
    const sameMother = member.mother_id && m.mother_id === member.mother_id;
    return sameFather || sameMother;
  });

  const birthYear = member.birth_date ? member.birth_date.split('-')[0] : '';
  const deathYear = member.death_date ? member.death_date.split('-')[0] : '';
  const isDeceased = Boolean(member.death_date);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-zinc-200 flex flex-col transform transition-transform duration-250 ease-out">
      {/* Header Drawer Atas */}
      <div className="relative h-32 bg-zinc-950 p-6 flex justify-between items-start text-white border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 text-xs font-semibold tracking-wide uppercase border border-zinc-700">
            Generasi ke-{member.generation || 1}
          </span>
          {isDeceased ? (
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 text-zinc-400 text-xs font-medium border border-zinc-800">
              Almarhum / Telah Wafat
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-md bg-darkorange-950/60 text-darkorange-300 text-xs font-medium border border-darkorange-800/60">
              Masih Hidup
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition border border-zinc-800"
          aria-label="Tutup rincian profil"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Foto & Rangkuman Profil Utama */}
      <div className="px-6 relative -mt-14 pb-4 border-b border-zinc-100 bg-white">
        <div className="flex items-end justify-between">
          <div className="w-24 h-24 rounded-full p-1 bg-white shadow-soft-lg">
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 border-2 border-zinc-200">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-2xl bg-zinc-800 text-white">
                  {member.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onStartRelationshipCheck(member.id)}
              className="px-3 py-1.5 rounded-xl bg-darkorange-700 hover:bg-darkorange-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="Cek hubungan kekerabatan anggota ini dengan anggota lain"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-200" />
              Cek Kekerabatan
            </button>
            {isAdminMode && onEditMember && (
              <button
                onClick={() => onEditMember(member)}
                className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition border border-zinc-200"
                title="Ubah rincian profil"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Nama Anggota */}
        <div className="mt-3">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            {member.full_name}
            {member.gender === 'female' ? (
              <span className="text-zinc-500 text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100">
                Perempuan ♀
              </span>
            ) : (
              <span className="text-zinc-700 text-xs font-semibold px-1.5 py-0.5 rounded bg-zinc-100">
                Laki-laki ♂
              </span>
            )}
          </h2>
          {member.nickname && (
            <p className="text-xs font-semibold text-darkorange-700 mt-0.5">
              Panggilan: &quot;{member.nickname}&quot;
            </p>
          )}
          {member.family_position && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {member.family_position}
            </p>
          )}
        </div>
      </div>

      {/* Rincian Konten (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Kisi Info Vital */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs">
          <div>
            <span className="text-zinc-500 font-medium flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-darkorange-700" />
              Kelahiran
            </span>
            <span className="font-bold text-zinc-800">
              {member.birth_date || 'Tidak tercatat'}
            </span>
            {member.birth_place && (
              <span className="block text-[11px] text-zinc-500 mt-0.5">
                {member.birth_place}
              </span>
            )}
          </div>

          <div>
            <span className="text-zinc-500 font-medium flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-zinc-600" />
              {isDeceased ? 'Wafat' : 'Status Kehidupan'}
            </span>
            <span className="font-bold text-zinc-800">
              {isDeceased ? member.death_date : 'Masih Hidup'}
            </span>
            {isDeceased && (
              <span className="block text-[11px] text-zinc-500 mt-0.5">
                {birthYear && deathYear ? `Usia: ${Number(deathYear) - Number(birthYear)} tahun` : ''}
              </span>
            )}
          </div>

          <div>
            <span className="text-zinc-500 font-medium flex items-center gap-1 mb-1">
              <Compass className="w-3 h-3 text-darkorange-700" />
              Kota Asal
            </span>
            <span className="font-bold text-zinc-800">
              {member.origin_city || 'Tidak tercatat'}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 font-medium flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-darkorange-700" />
              Domisili Saat Ini
            </span>
            <span className="font-bold text-zinc-800">
              {member.current_city || 'Tidak tercatat'}
            </span>
          </div>
        </div>

        {/* Biografi & Catatan Keluarga */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-darkorange-700" />
            Biografi & Catatan Kisah Keluarga
          </h3>
          <p className="text-xs leading-relaxed text-zinc-700 bg-zinc-50 p-3.5 rounded-xl border border-zinc-200/80">
            {member.bio ||
              'Belum ada catatan biografi yang ditulis. Editor keluarga dapat melengkapi riwayat hidup melalui Mode Admin.'}
          </p>
        </div>

        {/* Jalur Hubungan Keluarga Langsung */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-darkorange-700" />
            Garis Kekerabatan Inti
          </h3>

          <div className="space-y-3">
            {/* Orang Tua */}
            {(father || mother) && (
              <div className="text-xs">
                <span className="text-zinc-500 block mb-1.5 font-medium">Orang Tua:</span>
                <div className="flex flex-wrap gap-2">
                  {father && (
                    <button
                      onClick={() => onFocusMember(father.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 flex items-center gap-1.5 transition"
                    >
                      <span className="text-[10px] uppercase font-bold text-darkorange-700">Ayah</span>
                      <span className="font-semibold">{father.full_name}</span>
                    </button>
                  )}
                  {mother && (
                    <button
                      onClick={() => onFocusMember(mother.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 flex items-center gap-1.5 transition"
                    >
                      <span className="text-[10px] uppercase font-bold text-darkorange-700">Ibu</span>
                      <span className="font-semibold">{mother.full_name}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pasangan */}
            {spouse && (
              <div className="text-xs">
                <span className="text-zinc-500 block mb-1.5 font-medium">Pasangan:</span>
                <button
                  onClick={() => onFocusMember(spouse.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-darkorange-50 hover:bg-darkorange-100 text-darkorange-950 border border-darkorange-200 flex items-center gap-1.5 transition"
                >
                  <Heart className="w-3 h-3 text-darkorange-700 fill-current" />
                  <span className="font-semibold">{spouse.full_name}</span>
                </button>
              </div>
            )}

            {/* Anak-anak */}
            {children.length > 0 && (
              <div className="text-xs">
                <span className="text-zinc-500 block mb-1.5 font-medium">
                  Anak ({children.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onFocusMember(child.id)}
                      className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium flex items-center gap-1 transition border border-zinc-200/60"
                    >
                      <GitBranch className="w-3 h-3 text-zinc-500" />
                      {child.nickname || child.full_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Saudara Kandung */}
            {siblings.length > 0 && (
              <div className="text-xs">
                <span className="text-zinc-500 block mb-1.5 font-medium">
                  Saudara Kandung ({siblings.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {siblings.map((sib) => (
                    <button
                      key={sib.id}
                      onClick={() => onFocusMember(sib.id)}
                      className="px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium transition border border-zinc-200/60"
                    >
                      {sib.nickname || sib.full_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
