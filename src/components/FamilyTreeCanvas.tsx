'use client';

import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  Node,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FamilyMemberNode } from './FamilyMemberNode';
import { FamilyNodeData } from '../utils/layoutEngine';
import { FamilyMember } from '../types/family';
import { Sparkles } from 'lucide-react';

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
  isAdminMode?: boolean;
  onUpdateNodePosition?: (id: string, x: number, y: number) => void;
}

export const FamilyTreeCanvasInner: React.FC<FamilyTreeCanvasProps> = ({
  nodes,
  edges,
  isRelationshipMode,
  isAdminMode = false,
  onUpdateNodePosition,
}) => {
  const [currentNodes, setNodes, onNodesChange] = useNodesState(nodes);

  useEffect(() => {
    setNodes(nodes);
  }, [nodes, setNodes]);

  const handleNodeDragStop = useCallback(
    (_event: any, node: any) => {
      if (!isAdminMode || !onUpdateNodePosition) return;
      onUpdateNodePosition(node.id, Math.round(node.position.x), Math.round(node.position.y));
    },
    [isAdminMode, onUpdateNodePosition]
  );

  return (
    <div className="relative w-full h-full min-h-[640px] bg-zinc-100/60 select-none overflow-hidden">
      <ReactFlow
        nodes={currentNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={isAdminMode ? onNodesChange : undefined}
        onNodeDragStop={handleNodeDragStop}
        nodesDraggable={isAdminMode}
        nodesConnectable={false}
        elementsSelectable={true}
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

        {/* Notifikasi Mode Cek Kekerabatan Kiri Atas */}
        {isRelationshipMode && (
          <Panel position="top-left" className="!m-4">
            <div className="bg-zinc-900 text-white px-3.5 py-2 rounded-2xl shadow-soft-md flex items-center gap-2 text-xs font-medium border border-zinc-700">
              <Sparkles className="w-4 h-4 text-darkorange-400" />
              <span>
                Pilih 2 anggota pada bagan pohon untuk menghitung hubungan kekerabatan
              </span>
            </div>
          </Panel>
        )}

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
