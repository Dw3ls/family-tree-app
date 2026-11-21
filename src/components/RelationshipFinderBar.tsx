'use client';

import React from 'react';
import { FamilyMember, RelationshipResult } from '../types/family';
import { Sparkles, ArrowRightLeft, X, CheckCircle2, Info } from 'lucide-react';

interface RelationshipFinderBarProps {
  isOpen: boolean;
  onToggle: () => void;
  members: FamilyMember[];
  selectedA: FamilyMember | null;
  selectedB: FamilyMember | null;
  onSelectA: (memberId: string | null) => void;
  onSelectB: (memberId: string | null) => void;
  onSwap: () => void;
  onClear: () => void;
  result: RelationshipResult | null;
}

export const RelationshipFinderBar: React.FC<RelationshipFinderBarProps> = ({
  isOpen,
  onToggle,
  members,
  selectedA,
  selectedB,
  onSelectA,
  onSelectB,
  onSwap,
  onClear,
  result,
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 transition-all hover:scale-[1.02] border border-zinc-700"
      >
        <span className="p-1 rounded-lg bg-darkorange-700 text-white">
          <Sparkles className="w-4 h-4" />
        </span>
        <span className="text-xs tracking-wide">Cek Hubungan Kekerabatan</span>
      </button>
    );
  }

  const memberMap = new Map(members.map((m) => [m.id, m]));

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 pointer-events-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-300 p-5 overflow-hidden transition-all">
        {/* Bar Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-100 text-darkorange-700 border border-zinc-200">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                Penemu & Kalkulator Hubungan Kekerabatan
              </h3>
              <p className="text-[11px] text-zinc-500">
                Pilih dua orang langsung dari bagan silsilah atau pilih melalui menu dropdown di bawah
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(selectedA || selectedB) && (
              <button
                onClick={onClear}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 px-2.5 py-1 rounded-md hover:bg-zinc-100 transition"
              >
                Bersihkan
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition"
              aria-label="Tutup panel kekerabatan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pemilih 2 Orang */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
          {/* Pemilih Orang A */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-zinc-800 flex items-center justify-between">
              <span>Orang A (Acuan / Referensi)</span>
              {selectedA && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  Gen {selectedA.generation}
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedA?.id || ''}
                onChange={(e) => onSelectA(e.target.value || null)}
                className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none transition"
              >
                <option value="">-- Pilih Orang A --</option>
                {members.map((m) => (
                  <option key={`a-${m.id}`} value={m.id}>
                    {m.full_name} ({m.nickname || `Gen ${m.generation}`})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tombol Tukar A <-> B */}
          <div className="flex justify-center pt-2 md:pt-4">
            <button
              onClick={onSwap}
              disabled={!selectedA && !selectedB}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition border border-zinc-200"
              title="Tukar Orang A dan Orang B"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Pemilih Orang B */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-darkorange-700 flex items-center justify-between">
              <span>Orang B (Kerabat yang Dihitung)</span>
              {selectedB && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  Gen {selectedB.generation}
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedB?.id || ''}
                onChange={(e) => onSelectB(e.target.value || null)}
                className="w-full bg-darkorange-50/40 border border-darkorange-300 text-zinc-900 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-darkorange-700 focus:outline-none transition"
              >
                <option value="">-- Pilih Orang B --</option>
                {members.map((m) => (
                  <option key={`b-${m.id}`} value={m.id}>
                    {m.full_name} ({m.nickname || `Gen ${m.generation}`})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Hasil Perhitungan Hubungan Kekerabatan */}
        {result && selectedA && selectedB && (
          <div className="mt-4 pt-3 border-t border-zinc-200 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-medium">
                    Status Hubungan Kekerabatan:
                  </span>
                  <span className="px-3 py-1 rounded-full bg-darkorange-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {result.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-800 mt-1.5 font-medium leading-relaxed">
                  {result.description}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[11px] text-zinc-600 font-semibold bg-zinc-200/80 px-2.5 py-1 rounded-md">
                  {result.path.length} Anggota dalam Jalur
                </span>
              </div>
            </div>

            {/* Jalur Langkah demi Langkah */}
            {result.steps.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-zinc-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Rantai Garis Hubungan (Breadcrumbs):
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {result.path.map((nodeId, idx) => {
                    const nodeMember = memberMap.get(nodeId);
                    const isLast = idx === result.path.length - 1;
                    return (
                      <React.Fragment key={`path-${nodeId}-${idx}`}>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-semibold ${
                            idx === 0
                              ? 'bg-zinc-900 text-white'
                              : isLast
                              ? 'bg-darkorange-700 text-white'
                              : 'bg-white border border-zinc-300 text-zinc-800'
                          }`}
                        >
                          {nodeMember?.nickname || nodeMember?.full_name || nodeId}
                        </span>
                        {!isLast && (
                          <span className="text-zinc-400 font-bold">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {(!selectedA || !selectedB) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
            <Info className="w-4 h-4 text-darkorange-700 shrink-0" />
            <span>
              {!selectedA
                ? 'Klik anggota keluarga mana saja pada bagan pohon untuk menetapkan Orang A.'
                : 'Sekarang pilih anggota kedua (Orang B) untuk menghitung hubungan kekerabatan mereka.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
