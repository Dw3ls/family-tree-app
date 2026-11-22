'use client';

import React, { useRef } from 'react';
import { FamilyMember } from '../types/family';
import { SearchAutocomplete } from './SearchAutocomplete';
import {
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  TreeDeciduous,
  Plus,
  Trash2,
  Download,
  UploadCloud,
  LayoutGrid,
} from 'lucide-react';

interface NavbarProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
  onResetView: () => void;
  isRelationshipMode: boolean;
  onToggleRelationshipMode: () => void;
  isAdminMode: boolean;
  onOpenAdminLogin: () => void;
  onToggleAdminMode: () => void;
  onAddNewMember: () => void;
  onClearAllData: () => void;
  onExportData: () => void;
  onImportData: (members: FamilyMember[]) => void;
  onResetLayout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  members,
  onSelectMember,
  onResetView,
  isRelationshipMode,
  onToggleRelationshipMode,
  isAdminMode,
  onOpenAdminLogin,
  onToggleAdminMode,
  onAddNewMember,
  onClearAllData,
  onExportData,
  onImportData,
  onResetLayout,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          onImportData(json);
        } else {
          alert('Format berkas tidak valid. Harap unggah berkas JSON silsilah yang sah.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Identitas Logo & Judul */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-950 flex items-center justify-center text-white border border-zinc-800 shadow-xs">
            <TreeDeciduous className="w-5 h-5 text-darkorange-400" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-zinc-900 leading-tight">
              Silsilah Keluarga
            </h2>
            <span className="text-[11px] font-semibold text-darkorange-700">
              Pohon Garis Keturunan Interaktif
            </span>
          </div>
        </div>

        {/* Kolom Pencarian Cepat */}
        <div className="flex-1 max-w-sm mx-2">
          <SearchAutocomplete
            members={members}
            onSelectMember={onSelectMember}
          />
        </div>

        {/* Tombol Kontrol Utama */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Pusatkan Tampilan */}
          <button
            onClick={onResetView}
            className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition flex items-center gap-1.5 text-xs font-semibold"
            title="Pusatkan kamera ke tampilan keseluruhan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Pusatkan</span>
          </button>

          {/* Tombol Ekspor JSON */}
          {members.length > 0 && (
            <button
              onClick={onExportData}
              className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Unduh cadangan data silsilah (JSON)"
            >
              <Download className="w-3.5 h-3.5 text-darkorange-700" />
              <span className="hidden xl:inline">Ekspor Data</span>
            </button>
          )}

          {/* Tombol Impor JSON (Admin Only) */}
          {isAdminMode && (
            <>
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition flex items-center gap-1.5 text-xs font-semibold"
                title="Pulihkan data silsilah dari berkas cadangan JSON"
              >
                <UploadCloud className="w-3.5 h-3.5 text-zinc-700" />
                <span className="hidden xl:inline">Impor JSON</span>
              </button>
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="hidden"
              />

              {onResetLayout && members.some((m) => m.custom_x !== undefined) && (
                <button
                  onClick={onResetLayout}
                  className="p-2 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition flex items-center gap-1.5 text-xs font-semibold"
                  title="Kembalikan posisi silsilah ke tata letak geometris otomatis"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-darkorange-700" />
                  <span className="hidden xl:inline">Tata Ulang Otomatis</span>
                </button>
              )}
            </>
          )}

          {/* Tombol Cek Kekerabatan */}
          {members.length >= 2 && (
            <button
              onClick={onToggleRelationshipMode}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                isRelationshipMode
                  ? 'bg-darkorange-700 text-white shadow-soft-sm'
                  : 'text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
              }`}
              title="Buka Alat Cek Hubungan Kekerabatan"
            >
              <Sparkles className="w-3.5 h-3.5 text-darkorange-400" />
              <span className="hidden md:inline">
                {isRelationshipMode ? 'Mode Cek Aktif' : 'Cek Kekerabatan'}
              </span>
            </button>
          )}

          {/* Tambah Anggota (Admin) */}
          {isAdminMode && (
            <button
              onClick={onAddNewMember}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft-sm transition border border-zinc-700"
              title="Tambah Anggota Keluarga Baru"
            >
              <Plus className="w-3.5 h-3.5 text-darkorange-400" />
              <span className="hidden sm:inline">Tambah Anggota</span>
            </button>
          )}

          {/* Indikator Status Autosave Cloud */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-[11px] font-semibold"
            title="Setiap penambahan, pengeditan, atau penghapusan anggota otomatis tersimpan langsung ke database cloud"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden lg:inline">Autosave Cloud</span>
          </div>

          {/* Mode Admin (Kunci / Buka) */}
          {isAdminMode ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleAdminMode}
                className="px-3 py-2 rounded-xl bg-zinc-900 text-darkorange-400 border border-zinc-800 text-xs font-bold flex items-center gap-1.5 shadow-soft-sm transition hover:bg-zinc-800"
                title="Keluar dari Mode Admin"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Aktif</span>
              </button>
              {members.length > 0 && (
                <button
                  onClick={onClearAllData}
                  className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition border border-zinc-200"
                  title="Kosongkan Semua Data Silsilah"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold flex items-center gap-1.5 border border-zinc-200 transition"
              title="Masuk ke Mode Admin / Editor"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Mode Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
