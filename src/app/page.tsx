'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { FamilyMember, RelationshipResult } from '../types/family';
import { calculateRelationship } from '../utils/relationshipEngine';
import { generateTreeLayout } from '../utils/layoutEngine';
import { familyService } from '../services/familyService';
import { Navbar } from '../components/Navbar';
import { LandingHero } from '../components/LandingHero';
import { FamilyTreeCanvasInner } from '../components/FamilyTreeCanvas';
import { ProfileDrawer } from '../components/ProfileDrawer';
import { RelationshipFinderBar } from '../components/RelationshipFinderBar';
import { EditMemberModal } from '../components/EditMemberModal';
import { AdminLoginModal } from '../components/AdminLoginModal';
import { ToastContainer, ToastMessage } from '../components/Toast';
import { UserPlus, Sparkles, Database } from 'lucide-react';

function FamilyTreeMain() {
  const { setCenter, fitView } = useReactFlow();

  // State data silsilah keluarga (dimulai bersih tanpa data dummy bawaan)
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // State antarmuka (UI)
  const [selectedDrawerMember, setSelectedDrawerMember] = useState<FamilyMember | null>(null);
  const [isRelationshipMode, setIsRelationshipMode] = useState(false);
  const [selectedAId, setSelectedAId] = useState<string | null>(null);
  const [selectedBId, setSelectedBId] = useState<string | null>(null);
  const [activeGenFilter, setActiveGenFilter] = useState<number | null>(null);

  // State Mode Admin
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Keyboard shortcut: Escape to close modals or drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditModalOpen) setIsEditModalOpen(false);
        else if (isAdminLoginOpen) setIsAdminLoginOpen(false);
        else if (selectedDrawerMember) setSelectedDrawerMember(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditModalOpen, isAdminLoginOpen, selectedDrawerMember]);

  // Muat data langsung dari database SQLite lokal saat awal membuka web
  useEffect(() => {
    async function loadData() {
      setIsLoadingData(true);
      try {
        const { members: remoteMembers } = await familyService.getMembers();
        if (remoteMembers) {
          setMembers(remoteMembers);
        }
      } catch (err) {
        console.warn('Gagal memuat dari database lokal:', err);
      } finally {
        setIsLoadingData(false);
      }

      // Periksa status login admin
      const isAdmin = await familyService.checkAdminStatus();
      if (isAdmin) {
        setIsAdminMode(true);
      }
    }
    loadData();
  }, []);

  // Ekspor cadangan data JSON
  const handleExportData = useCallback(() => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(members, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `silsilah-keluarga-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Cadangan berkas data silsilah berhasil diunduh.', 'success');
    } catch (e) {
      showToast('Gagal mengekspor data silsilah.', 'error');
    }
  }, [members, showToast]);

  // Impor cadangan data JSON ke database SQLite lokal
  const handleImportData = useCallback(async (importedMembers: FamilyMember[]) => {
    try {
      const res = await fetch('/api/members/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(familyService.getAdminToken() ? { Authorization: `Bearer ${familyService.getAdminToken()}` } : {}),
        },
        body: JSON.stringify({ members: importedMembers }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMembers(json.data);
          showToast(`Berhasil mengimpor ${json.data.length} anggota keluarga ke database lokal.`, 'success');
          return;
        }
      }
      showToast('Gagal mengimpor data silsilah.', 'error');
    } catch (e) {
      showToast('Terjadi kesalahan saat mengimpor data.', 'error');
    }
  }, [showToast]);

  // Kosongkan seluruh data silsilah di database SQLite lokal
  const handleClearAllData = useCallback(async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua data anggota silsilah di database lokal? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const res = await fetch('/api/members/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(familyService.getAdminToken() ? { Authorization: `Bearer ${familyService.getAdminToken()}` } : {}),
        },
      });

      if (res.ok) {
        setMembers([]);
        setSelectedDrawerMember(null);
        setSelectedAId(null);
        setSelectedBId(null);
        showToast('Database silsilah keluarga lokal telah dikosongkan.', 'info');
      }
    } catch (err) {
      showToast('Gagal mengosongkan data.', 'error');
    }
  }, [showToast]);

  // Arahkan kamera kanvas ke posisi anggota tertentu
  const handleFocusMember = useCallback(
    (memberId: string) => {
      const found = members.find((m) => m.id === memberId);
      if (!found) return;

      setTimeout(() => {
        const layout = generateTreeLayout(members);
        const node = layout.nodes.find((n) => n.id === memberId);
        if (node) {
          setCenter(node.position.x + 90, node.position.y + 70, {
            zoom: 1.15,
            duration: 800,
          });
        }
      }, 50);
    },
    [members, setCenter]
  );

  // Pusatkan kembali tampilan ke akar silsilah
  const handleResetView = useCallback(() => {
    fitView({ padding: 0.15, duration: 700 });
  }, [fitView]);

  // Klik anggota (membuka drawer profil)
  const handleSelectMember = useCallback(
    (member: FamilyMember) => {
      setSelectedDrawerMember(member);
      handleFocusMember(member.id);
    },
    [handleFocusMember]
  );

  // Pemilihan cepat pada mode cek kekerabatan
  const handleQuickChooseRelationship = useCallback(
    (member: FamilyMember) => {
      if (!selectedAId) {
        setSelectedAId(member.id);
      } else if (!selectedBId) {
        if (member.id === selectedAId) {
          setSelectedAId(null);
        } else {
          setSelectedBId(member.id);
        }
      } else {
        setSelectedBId(member.id);
      }
      handleFocusMember(member.id);
    },
    [selectedAId, selectedBId, handleFocusMember]
  );

  // Hitung hubungan kekerabatan jika Orang A & B telah dipilih
  const relationshipResult: RelationshipResult | null = useMemo(() => {
    if (selectedAId && selectedBId && members.length > 0) {
      return calculateRelationship(selectedAId, selectedBId, members);
    }
    return null;
  }, [selectedAId, selectedBId, members]);

  // Jalur aktif yang disorot pada kanvas
  const highlightedPath = useMemo(() => {
    if (relationshipResult?.path) {
      return relationshipResult.path;
    }
    if (selectedAId) return [selectedAId];
    return [];
  }, [relationshipResult, selectedAId]);

  // Operasi CRUD Admin via Backend API
  const handleOpenAddMember = () => {
    if (!isAdminMode) {
      setIsAdminLoginOpen(true);
      return;
    }
    setEditingMember(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditMember = (member: FamilyMember) => {
    if (!isAdminMode) {
      setIsAdminLoginOpen(true);
      return;
    }
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async (savedMember: FamilyMember) => {
    const exists = members.some((m) => m.id === savedMember.id);
    let updatedMember = savedMember;

    try {
      if (exists) {
        updatedMember = await familyService.updateMember(savedMember.id, savedMember);
        setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
        showToast(`Profil ${updatedMember.full_name} berhasil diperbarui di database lokal.`, 'success');
      } else {
        updatedMember = await familyService.createMember(savedMember);
        setMembers((prev) => [...prev, updatedMember]);
        showToast(`Anggota baru ${updatedMember.full_name} berhasil disimpan ke database lokal.`, 'success');
      }

      if (selectedDrawerMember?.id === updatedMember.id) {
        setSelectedDrawerMember(updatedMember);
      }
    } catch (e) {
      showToast('Gagal menyimpan data ke database lokal.', 'error');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const target = members.find((m) => m.id === memberId);
    try {
      await familyService.deleteMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      if (selectedDrawerMember?.id === memberId) {
        setSelectedDrawerMember(null);
      }
      if (selectedAId === memberId) setSelectedAId(null);
      if (selectedBId === memberId) setSelectedBId(null);
      showToast(`${target?.full_name || 'Anggota'} berhasil dihapus dari database lokal.`, 'info');
    } catch (e) {
      showToast('Gagal menghapus anggota.', 'error');
    }
  };

  // Buat node dan edges sesuai algoritma layout
  const { nodes, edges } = useMemo(() => {
    return generateTreeLayout(
      members,
      highlightedPath,
      selectedAId,
      selectedBId,
      isRelationshipMode,
      isAdminMode,
      {
        onSelectMember: handleSelectMember,
        onEditMember: handleOpenEditMember,
        onDeleteMember: handleDeleteMember,
        onQuickChooseRelationship: handleQuickChooseRelationship,
      }
    );
  }, [
    members,
    highlightedPath,
    selectedAId,
    selectedBId,
    isRelationshipMode,
    isAdminMode,
    handleSelectMember,
    handleQuickChooseRelationship,
  ]);

  // Metrik untuk ringkasan di banner
  const totalGenerations = useMemo(() => {
    if (members.length === 0) return 0;
    return Math.max(...members.map((m) => m.generation || 1), 1);
  }, [members]);

  const totalLiving = useMemo(() => {
    return members.filter((m) => !m.death_date).length;
  }, [members]);

  const citiesCount = useMemo(() => {
    const set = new Set(
      members
        .map((m) => m.current_city)
        .filter(Boolean) as string[]
    );
    return set.size;
  }, [members]);

  const selectedA = useMemo(
    () => members.find((m) => m.id === selectedAId) || null,
    [members, selectedAId]
  );
  const selectedB = useMemo(
    () => members.find((m) => m.id === selectedBId) || null,
    [members, selectedBId]
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 text-zinc-900 font-sans">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Navigasi Atas */}
      <Navbar
        members={members}
        onSelectMember={handleSelectMember}
        onResetView={handleResetView}
        isRelationshipMode={isRelationshipMode}
        onToggleRelationshipMode={() => {
          setIsRelationshipMode(!isRelationshipMode);
        }}
        isAdminMode={isAdminMode}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onToggleAdminMode={async () => {
          if (isAdminMode) {
            await familyService.logoutAdmin();
            setIsAdminMode(false);
            showToast('Anda telah keluar dari Mode Admin.', 'info');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onAddNewMember={handleOpenAddMember}
        onClearAllData={handleClearAllData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Banner Silsilah Keluarga */}
      <LandingHero
        totalGenerations={totalGenerations}
        totalMembers={members.length}
        totalLiving={totalLiving}
        citiesCount={citiesCount}
        onExploreCanvas={handleResetView}
        onOpenRelationshipFinder={() => setIsRelationshipMode(true)}
        onAddNewMember={handleOpenAddMember}
        isAdminMode={isAdminMode}
      />

      {/* Area Kanvas Silsilah Interaktif */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {isLoadingData ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100/60 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-900 border-t-darkorange-700 animate-spin" />
            <span className="text-xs font-semibold text-zinc-600">Memuat Silsilah dari Database Lokal...</span>
          </div>
        ) : members.length === 0 ? (
          /* Empty State Bersih Tanpa Data Dummy */
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100/60 p-6 text-center">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-zinc-200 shadow-soft-lg flex flex-col items-center animate-scaleIn">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-white mb-4 border border-zinc-800 shadow-xs">
                <Database className="w-8 h-8 text-darkorange-400" />
              </div>

              <h3 className="text-lg font-bold text-zinc-900">
                Database Silsilah Masih Bersih
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Belum ada data anggota keluarga. Silakan mulai membangun pohon silsilah keluarga Anda dengan menambahkan anggota keluarga pertama (Leluhur / Kepala Keluarga).
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 w-full">
                <button
                  onClick={handleOpenAddMember}
                  className="w-full py-2.5 px-4 rounded-xl bg-darkorange-700 hover:bg-darkorange-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-soft-sm transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tambah Anggota Pertama</span>
                </button>
              </div>

              {!isAdminMode && (
                <p className="text-[11px] text-zinc-400 mt-4">
                  Masuk sebagai Admin terlebih dahulu untuk mulai menambahkan data silsilah.
                </p>
              )}
            </div>
          </div>
        ) : (
          <FamilyTreeCanvasInner
            nodes={nodes}
            edges={edges}
            onSelectMember={handleSelectMember}
            isRelationshipMode={isRelationshipMode}
            selectedA={selectedA}
            selectedB={selectedB}
            onResetView={handleResetView}
            activeGenFilter={activeGenFilter}
            setActiveGenFilter={setActiveGenFilter}
          />
        )}

        {/* Panel Samping (Drawer Profil Anggota) */}
        <ProfileDrawer
          member={selectedDrawerMember}
          onClose={() => setSelectedDrawerMember(null)}
          allMembers={members}
          onFocusMember={handleFocusMember}
          onStartRelationshipCheck={(memberAId) => {
            setSelectedAId(memberAId);
            setIsRelationshipMode(true);
            setSelectedDrawerMember(null);
          }}
          onEditMember={handleOpenEditMember}
          isAdminMode={isAdminMode}
        />

        {/* Panel Melayang Kalkulator Kekerabatan */}
        {members.length >= 2 && (
          <RelationshipFinderBar
            isOpen={isRelationshipMode}
            onToggle={() => setIsRelationshipMode(!isRelationshipMode)}
            members={members}
            selectedA={selectedA}
            selectedB={selectedB}
            onSelectA={(id) => setSelectedAId(id)}
            onSelectB={(id) => setSelectedBId(id)}
            onSwap={() => {
              const temp = selectedAId;
              setSelectedAId(selectedBId);
              setSelectedBId(temp);
            }}
            onClear={() => {
              setSelectedAId(null);
              setSelectedBId(null);
            }}
            result={relationshipResult}
          />
        )}
      </main>

      {/* Dialog Modal Ubah / Tambah Anggota */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={editingMember}
        allMembers={members}
        onSave={handleSaveMember}
        onDelete={handleDeleteMember}
        defaultGeneration={members.length === 0 ? 1 : 2}
      />

      {/* Dialog Modal Masuk Admin */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminMode(true);
          showToast('Mode Admin aktif! Anda dapat menambah dan mengelola silsilah.', 'success');
        }}
      />
    </div>
  );
}

export default function FamilyTreePage() {
  return (
    <ReactFlowProvider>
      <FamilyTreeMain />
    </ReactFlowProvider>
  );
}
