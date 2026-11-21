'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { INITIAL_FAMILY_MEMBERS } from '../data/initialFamilyData';
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

function FamilyTreeMain() {
  const { setCenter, fitView } = useReactFlow();

  // State data silsilah keluarga
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [dataSource, setDataSource] = useState<string>('loading');

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

  // Muat data dari Backend API saat awal membuka aplikasi
  useEffect(() => {
    async function loadData() {
      try {
        const { members: remoteMembers, source } = await familyService.getMembers();
        if (remoteMembers && remoteMembers.length > 0) {
          setMembers(remoteMembers);
          setDataSource(source);
        }
      } catch (err) {
        console.warn('Gagal memuat dari backend:', err);
      }

      // Periksa juga apakah sesi admin masih aktif
      const isAdmin = await familyService.checkAdminStatus();
      if (isAdmin) {
        setIsAdminMode(true);
      }
    }
    loadData();
  }, []);

  // Kembalikan ke data demo awal via backend API
  const handleResetDemoData = useCallback(async () => {
    try {
      const resetData = await familyService.resetToDemo();
      setMembers(resetData);
      setSelectedDrawerMember(null);
      setSelectedAId(null);
      setSelectedBId(null);
    } catch (err) {
      console.warn('Gagal reset demo:', err);
    }
  }, []);

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
    if (selectedAId && selectedBId) {
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
    setEditingMember(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async (savedMember: FamilyMember) => {
    const exists = members.some((m) => m.id === savedMember.id);
    let updatedMember = savedMember;

    if (exists) {
      updatedMember = await familyService.updateMember(savedMember.id, savedMember);
      setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    } else {
      updatedMember = await familyService.createMember(savedMember);
      setMembers((prev) => [...prev, updatedMember]);
    }

    if (selectedDrawerMember?.id === updatedMember.id) {
      setSelectedDrawerMember(updatedMember);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    await familyService.deleteMember(memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (selectedDrawerMember?.id === memberId) {
      setSelectedDrawerMember(null);
    }
    if (selectedAId === memberId) setSelectedAId(null);
    if (selectedBId === memberId) setSelectedBId(null);
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
    return Math.max(...members.map((m) => m.generation || 1), 4);
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
    return Math.max(set.size, 6);
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
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onAddNewMember={handleOpenAddMember}
        onResetDemoData={handleResetDemoData}
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
      </main>

      {/* Dialog Modal Ubah / Tambah Anggota */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={editingMember}
        allMembers={members}
        onSave={handleSaveMember}
        onDelete={handleDeleteMember}
      />

      {/* Dialog Modal Masuk Admin */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminMode(true);
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
