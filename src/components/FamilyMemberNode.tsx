'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FamilyNodeData } from '../utils/layoutEngine';
import { Heart, Sparkles, Pencil, Trash2, MapPin } from 'lucide-react';

export const FamilyMemberNode = memo(({ data }: { data: FamilyNodeData }) => {
  const {
    member,
    isHighlighted,
    isDimmed,
    isSelectedA,
    isSelectedB,
    isAdminMode,
    isRelationshipMode,
    generationLabel,
    onSelectMember,
    onEditMember,
    onDeleteMember,
    onQuickChooseRelationship,
  } = data;

  const birthYear = member.birth_date ? member.birth_date.split('-')[0] : '';
  const deathYear = member.death_date ? member.death_date.split('-')[0] : '';
  const lifespan = deathYear
    ? `${birthYear} – ${deathYear}`
    : birthYear
    ? `l. ${birthYear}`
    : '';

  const isMale = member.gender === 'male';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRelationshipMode && onQuickChooseRelationship) {
      onQuickChooseRelationship(member);
    } else if (onSelectMember) {
      onSelectMember(member);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group cursor-pointer transition-all duration-200 select-none ${
        isDimmed ? 'opacity-25 grayscale-[70%] scale-95 pointer-events-none' : 'opacity-100'
      }`}
      style={{ width: '180px' }}
    >
      {/* React Flow Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-parent"
        className="!w-2 !h-2 !bg-zinc-600 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-child"
        className="!w-2 !h-2 !bg-zinc-800 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-marriage"
        className="!w-2 !h-2 !bg-darkorange-700 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-marriage"
        className="!w-2 !h-2 !bg-darkorange-700 !border-2 !border-white !opacity-0 group-hover:!opacity-100 transition-opacity"
      />

      {/* Indikator Pilihan Hubungan (Orang A / Orang B) */}
      {isSelectedA && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 bg-zinc-900 border border-zinc-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
          <span>Orang A</span>
        </div>
      )}
      {isSelectedB && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 bg-darkorange-700 border border-darkorange-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
          <span>Orang B</span>
        </div>
      )}

      {/* Kartu Profil Anggota */}
      <div
        className={`flex flex-col items-center p-3 rounded-2xl bg-white transition-all duration-200 ${
          isSelectedA
            ? 'ring-2 ring-zinc-900 shadow-glow-dark scale-[1.03]'
            : isSelectedB
            ? 'ring-2 ring-darkorange-700 shadow-glow-orange scale-[1.03]'
            : isHighlighted
            ? 'ring-2 ring-darkorange-700/90 shadow-soft-lg scale-[1.02] bg-darkorange-50/50'
            : 'border border-zinc-200/90 hover:border-zinc-400 hover:shadow-soft-md'
        }`}
      >
        {/* Label Generasi */}
        <div className="absolute top-2.5 right-2.5 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200/60">
          {generationLabel}
        </div>

        {/* Bingkai Avatar Sirkuler */}
        <div className="relative mt-1 mb-2">
          <div
            className={`w-20 h-20 rounded-full p-1 transition-transform duration-200 ${
              isSelectedA
                ? 'bg-zinc-900 p-[2.5px]'
                : isSelectedB
                ? 'bg-darkorange-700 p-[2.5px]'
                : isHighlighted
                ? 'bg-darkorange-600 p-[2.5px]'
                : isMale
                ? 'bg-zinc-700'
                : 'bg-zinc-500'
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-100 border-2 border-white">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.photo_url}
                  alt={member.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-lg bg-zinc-800 text-white">
                  {member.full_name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          {/* Indikator Wafat / Menikah */}
          {member.death_date ? (
            <div
              title={`Wafat pada tahun ${deathYear}`}
              className="absolute -bottom-1 -right-1 bg-zinc-900 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-zinc-700 shadow-xs"
            >
              WAFAT
            </div>
          ) : member.spouse_id ? (
            <div
              title="Menikah"
              className="absolute -bottom-1 -right-1 bg-darkorange-700 text-white p-1 rounded-full border-2 border-white shadow-xs"
            >
              <Heart className="w-2.5 h-2.5 fill-current" />
            </div>
          ) : null}
        </div>

        {/* Nama & Nama Panggilan */}
        <div className="text-center w-full px-1">
          <h4 className="text-[12px] font-bold text-zinc-900 leading-snug truncate" title={member.full_name}>
            {member.nickname || member.full_name}
          </h4>
          {member.nickname && (
            <p className="text-[10px] text-zinc-500 truncate" title={member.full_name}>
              {member.full_name}
            </p>
          )}

          {/* Tahun Lahir / Wafat */}
          {lifespan && (
            <p className="text-[10px] font-medium text-zinc-400 mt-0.5">
              {lifespan}
            </p>
          )}

          {/* Domisili */}
          {member.current_city && (
            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 mt-1 truncate">
              <MapPin className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
              <span className="truncate">{member.current_city}</span>
            </div>
          )}
        </div>

        {/* Kontrol Hover Mode Admin */}
        {isAdminMode && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-100 w-full justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEditMember) onEditMember(member);
              }}
              className="p-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition"
              title="Ubah Profil"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDeleteMember && confirm(`Yakin ingin menghapus ${member.full_name}?`)) {
                  onDeleteMember(member.id);
                }
              }}
              className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 transition"
              title="Hapus Anggota"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tombol Pilih Cepat pada Mode Kekerabatan */}
        {isRelationshipMode && (
          <div className="mt-2 w-full">
            <button
              onClick={handleClick}
              className={`w-full py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
                isSelectedA || isSelectedB
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 hover:bg-darkorange-50 text-zinc-800 hover:text-darkorange-800 border border-zinc-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-darkorange-700" />
              {isSelectedA ? 'Orang A' : isSelectedB ? 'Orang B' : 'Pilih'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

FamilyMemberNode.displayName = 'FamilyMemberNode';
