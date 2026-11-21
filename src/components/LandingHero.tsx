'use client';

import React from 'react';
import {
  Compass,
  Sparkles,
  Users,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

interface LandingHeroProps {
  totalGenerations: number;
  totalMembers: number;
  totalLiving: number;
  citiesCount: number;
  onExploreCanvas: () => void;
  onOpenRelationshipFinder: () => void;
  onAddNewMember?: () => void;
  isAdminMode?: boolean;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  totalGenerations,
  totalMembers,
  totalLiving,
  citiesCount,
  onExploreCanvas,
  onOpenRelationshipFinder,
  onAddNewMember,
  isAdminMode,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div className="relative bg-zinc-950 text-white border-b border-zinc-800 shadow-soft-md transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Judul & Pengantar */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-darkorange-300 text-[10px] font-bold tracking-wider uppercase border border-zinc-700">
                Garis Keturunan Keluarga Besar Soedirdjo
              </span>
              <span className="text-zinc-400 text-xs">Mulai 1936</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Bagan Silsilah Interaktif & Kalkulator Kekerabatan</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mt-1 leading-relaxed">
              Jelajahi empat generasi silsilah keluarga, pelajari riwayat asal-usul tiap anggota, dan hitung hubungan kekerabatan secara langsung tanpa memerlukan login.
            </p>
          </div>

          {/* Tombol Tindakan Cepat */}
          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={onOpenRelationshipFinder}
              className="px-3.5 py-2 rounded-xl bg-darkorange-700 hover:bg-darkorange-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-200" />
              Cek Kekerabatan
            </button>

            {isAdminMode && onAddNewMember && (
              <button
                onClick={onAddNewMember}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition"
              >
                <Plus className="w-3.5 h-3.5 text-darkorange-400" />
                Tambah Anggota
              </button>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-1 transition border border-zinc-800"
              title={isCollapsed ? 'Tampilkan statistik keluarga' : 'Sembunyikan statistik'}
            >
              {isCollapsed ? (
                <>
                  <span className="hidden sm:inline">Statistik</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Ringkas</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Statistik Keluarga */}
        {!isCollapsed && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/80 animate-fadeIn">
            <div className="flex items-center gap-3 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <div className="p-2 rounded-lg bg-zinc-800 text-darkorange-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">
                  {totalGenerations} Generasi
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Tahun 1936 hingga Kini
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">
                  {totalMembers} Anggota
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  {totalLiving} Masih Hidup
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <div className="p-2 rounded-lg bg-zinc-800 text-darkorange-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">
                  {citiesCount}+ Kota
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Persebaran Domisili
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800">
              <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200">
                <Sparkles className="w-4 h-4 text-darkorange-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-none">
                  Kalkulator Kekerabatan
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Analisis Graf Silsilah Otomatis
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
