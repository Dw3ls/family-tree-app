'use client';

import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  Panel,
  BackgroundVariant,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyMemberNode } from './FamilyMemberNode';
import { FamilyNodeData } from '../utils/layoutEngine';
import { FamilyMember } from '../types/family';
import { Layers, Sparkles } from 'lucide-react';

const nodeTypes = {
  familyMember: FamilyMemberNode,
};

interface FamilyTreeCanvasProps {
  nodes: Node<FamilyNodeData>[];
  edges: any[];
  onSelectMember: (member: FamilyMember) => void;
  isRelationshipMode: boolean;
  selectedA: FamilyMember | null;
  selectedB: FamilyMember | null;
  onResetView: () => void;
  activeGenFilter: number | null;
  setActiveGenFilter: (gen: number | null) => void;
}

export const FamilyTreeCanvasInner: React.FC<FamilyTreeCanvasProps> = ({
  nodes,
  edges,
  isRelationshipMode,
  activeGenFilter,
  setActiveGenFilter,
}) => {
  const filteredNodes = useMemo(() => {
    if (activeGenFilter === null) return nodes;
    return nodes.map((node) => {
      const isMatch = node.data.member.generation === activeGenFilter;
      return {
        ...node,
        data: {
          ...node.data,
          isDimmed: !isMatch,
        },
      };
    });
  }, [nodes, activeGenFilter]);

  return (
    <div className="relative w-full h-full min-h-[640px] bg-zinc-100/60 select-none overflow-hidden">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, duration: 600 }}
        minZoom={0.2}
        maxZoom={1.8}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="#cbd5e1"
        />

        {/* Kontrol Zoom / Pan Kiri Bawah */}
        <Controls
          position="bottom-left"
          showInteractive={false}
          className="!bg-white !rounded-2xl !shadow-soft-md !border !border-zinc-200 !overflow-hidden !p-1"
        />

        {/* MiniMap Kanan Atas */}
        <MiniMap
          position="top-right"
          zoomable
          pannable
          className="!bg-white !rounded-2xl !shadow-soft-md !border !border-zinc-200 !overflow-hidden hidden md:block"
          nodeColor={(node: any) => {
            if (node.data?.isHighlighted) return '#c2410c';
            return node.data?.member?.gender === 'female' ? '#71717a' : '#27272a';
          }}
          nodeStrokeWidth={2}
          maskColor="rgba(244, 244, 245, 0.7)"
        />

        {/* Panel Filter Generasi Kiri Atas */}
        <Panel position="top-left" className="!m-4 flex flex-col gap-2">
          {/* Tab Pilihan Generasi */}
          <div className="bg-white p-1.5 rounded-2xl shadow-soft-md border border-zinc-200 flex items-center gap-1">
            <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-darkorange-700" />
              <span className="hidden sm:inline">Generasi</span>
            </div>
            <button
              onClick={() => setActiveGenFilter(null)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                activeGenFilter === null
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Semua
            </button>
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenFilter(activeGenFilter === g ? null : g)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                  activeGenFilter === g
                    ? 'bg-darkorange-700 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                Gen {g}
              </button>
            ))}
          </div>

          {/* Notifikasi Mode Cek Kekerabatan */}
          {isRelationshipMode && (
            <div className="bg-zinc-900 text-white px-3.5 py-2 rounded-2xl shadow-soft-md flex items-center gap-2 text-xs font-medium border border-zinc-700">
              <Sparkles className="w-4 h-4 text-darkorange-400" />
              <span>
                Pilih 2 anggota pada bagan pohon untuk menghitung hubungan kekerabatan
              </span>
            </div>
          )}
        </Panel>

        {/* Legenda Bagan Silsilah Bawah */}
        <Panel position="bottom-center" className="!mb-3 hidden sm:flex">
          <div className="bg-white px-4 py-2 rounded-full shadow-soft-sm border border-zinc-200 flex items-center gap-5 text-[11px] font-medium text-zinc-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <span>Laki-laki</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
              <span>Perempuan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-darkorange-700 font-bold">⚭</span>
              <span>Pernikahan (Garis Horizontal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-700 font-bold">↓</span>
              <span>Garis Keturunan (Ortogonal)</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
