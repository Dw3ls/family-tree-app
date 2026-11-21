import { Node, Edge, MarkerType } from '@xyflow/react';
import { FamilyMember } from '../types/family';

export interface FamilyNodeData extends Record<string, unknown> {
  member: FamilyMember;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isSelectedA?: boolean;
  isSelectedB?: boolean;
  isAdminMode?: boolean;
  isRelationshipMode?: boolean;
  generationLabel?: string;
  onSelectMember?: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onDeleteMember?: (memberId: string) => void;
  onQuickChooseRelationship?: (member: FamilyMember) => void;
}

export function generateTreeLayout(
  members: FamilyMember[],
  highlightedPath: string[] = [],
  selectedAId: string | null = null,
  selectedBId: string | null = null,
  isRelationshipMode: boolean = false,
  isAdminMode: boolean = false,
  handlers?: {
    onSelectMember?: (member: FamilyMember) => void;
    onEditMember?: (member: FamilyMember) => void;
    onDeleteMember?: (memberId: string) => void;
    onQuickChooseRelationship?: (member: FamilyMember) => void;
  }
): { nodes: Node<FamilyNodeData>[]; edges: Edge[] } {
  const memberMap = new Map<string, FamilyMember>(members.map((m) => [m.id, m]));
  const hasHighlight = highlightedPath.length > 0;
  const pathSet = new Set(highlightedPath);

  const LEVEL_Y_SPACING = 270;
  const START_Y = 120;

  const genMap = new Map<string, number>();
  members.forEach((m) => {
    let gen = m.generation || 1;
    if (!m.generation) {
      if (!m.father_id && !m.mother_id) {
        gen = 1;
      } else {
        const father = m.father_id ? memberMap.get(m.father_id) : null;
        const mother = m.mother_id ? memberMap.get(m.mother_id) : null;
        const parentGen = Math.max(father?.generation || 1, mother?.generation || 1);
        gen = parentGen + 1;
      }
    }
    genMap.set(m.id, gen);
  });

  // Penataan koordinat hierarki yang proporsional dan terstruktur rapi
  const defaultCoordinates: Record<string, { x: number; y: number }> = {
    // Generasi 1: Eyang Soedirdjo & Siti Rahayu (Pusat Garis Silsilah)
    'gen1-soedirdjo': { x: 740, y: START_Y },
    'gen1-siti': { x: 980, y: START_Y },

    // Generasi 2:
    // Cabang 1: Bambang & Dewi
    'gen2-bambang': { x: 260, y: START_Y + LEVEL_Y_SPACING },
    'gen2-dewi': { x: 500, y: START_Y + LEVEL_Y_SPACING },
    // Cabang 2: Retno & Hendro
    'gen2-retno': { x: 920, y: START_Y + LEVEL_Y_SPACING },
    'gen2-hendro': { x: 1160, y: START_Y + LEVEL_Y_SPACING },
    // Om Agus (Solo)
    'gen2-agus': { x: 1440, y: START_Y + LEVEL_Y_SPACING },

    // Generasi 3:
    // Keturunan Bambang:
    // Dimas & Nadia
    'gen3-dimas': { x: 140, y: START_Y + LEVEL_Y_SPACING * 2 },
    'gen3-nadia': { x: 380, y: START_Y + LEVEL_Y_SPACING * 2 },
    // Anisa (Solo)
    'gen3-anisa': { x: 580, y: START_Y + LEVEL_Y_SPACING * 2 },

    // Keturunan Retno:
    // Fajar (Solo)
    'gen3-fajar': { x: 860, y: START_Y + LEVEL_Y_SPACING * 2 },
    // Clarissa & Reza
    'gen3-clarissa': { x: 1100, y: START_Y + LEVEL_Y_SPACING * 2 },
    'gen3-reza': { x: 1340, y: START_Y + LEVEL_Y_SPACING * 2 },

    // Generasi 4:
    // Kenzo (Anak Dimas & Nadia)
    'gen4-kenzo': { x: 260, y: START_Y + LEVEL_Y_SPACING * 3 },
    // Alana (Anak Clarissa & Reza)
    'gen4-alana': { x: 1220, y: START_Y + LEVEL_Y_SPACING * 3 },
  };

  const positions = new Map<string, { x: number; y: number }>();
  const genMaxX = new Map<number, number>();

  members.forEach((m) => {
    const gen = genMap.get(m.id) || 1;
    if (defaultCoordinates[m.id]) {
      positions.set(m.id, defaultCoordinates[m.id]);
      const curMax = genMaxX.get(gen) || 0;
      genMaxX.set(gen, Math.max(curMax, defaultCoordinates[m.id].x + 240));
    }
  });

  // Posisi anggota baru yang ditambahkan via Admin
  members.forEach((m) => {
    if (!positions.has(m.id)) {
      const gen = genMap.get(m.id) || 1;
      const currentX = (genMaxX.get(gen) || 200) + 60;
      const y = START_Y + (gen - 1) * LEVEL_Y_SPACING;
      positions.set(m.id, { x: currentX, y });
      genMaxX.set(gen, currentX + 220);
    }
  });

  // Node React Flow
  const nodes: Node<FamilyNodeData>[] = members.map((member) => {
    const pos = positions.get(member.id) || { x: 100, y: 100 };
    const isSelectedA = selectedAId === member.id;
    const isSelectedB = selectedBId === member.id;
    const isHighlighted = isSelectedA || isSelectedB || pathSet.has(member.id);
    const isDimmed = hasHighlight && !isHighlighted;
    const gen = genMap.get(member.id) || 1;

    return {
      id: member.id,
      type: 'familyMember',
      position: pos,
      data: {
        member,
        isHighlighted,
        isDimmed,
        isSelectedA,
        isSelectedB,
        isAdminMode,
        isRelationshipMode,
        generationLabel: `Gen ${gen}`,
        onSelectMember: handlers?.onSelectMember,
        onEditMember: handlers?.onEditMember,
        onDeleteMember: handlers?.onDeleteMember,
        onQuickChooseRelationship: handlers?.onQuickChooseRelationship,
      },
    };
  });

  // Edge / Garis Penghubung Silsilah
  const edges: Edge[] = [];
  const processedCouples = new Set<string>();

  // 1. Garis Pernikahan (Horizontal, Abu Gelap / Dark Orange saat aktif)
  members.forEach((m) => {
    if (m.spouse_id && memberMap.has(m.spouse_id)) {
      const coupleKey = [m.id, m.spouse_id].sort().join('--');
      if (!processedCouples.has(coupleKey)) {
        processedCouples.add(coupleKey);
        const isPathEdge =
          pathSet.has(m.id) &&
          pathSet.has(m.spouse_id) &&
          Math.abs(highlightedPath.indexOf(m.id) - highlightedPath.indexOf(m.spouse_id)) === 1;

        const isEdgeDimmed = hasHighlight && !isPathEdge;

        edges.push({
          id: `marriage-${coupleKey}`,
          source: m.id,
          target: m.spouse_id,
          sourceHandle: 'right-marriage',
          targetHandle: 'left-marriage',
          type: 'straight',
          animated: isPathEdge,
          label: '⚭',
          labelStyle: {
            fontSize: '13px',
            fill: isPathEdge ? '#c2410c' : '#52525b',
            fontWeight: 700,
          },
          labelBgStyle: {
            fill: '#ffffff',
            fillOpacity: 0.95,
            stroke: isPathEdge ? '#c2410c' : '#d4d4d8',
            strokeWidth: 1.5,
            rx: 8,
            ry: 8,
          },
          labelBgPadding: [6, 3],
          style: {
            stroke: isPathEdge ? '#c2410c' : '#71717a',
            strokeWidth: isPathEdge ? 3.5 : 2,
            strokeDasharray: isPathEdge ? undefined : '5,5',
            opacity: isEdgeDimmed ? 0.15 : 1,
            transition: 'all 0.3s ease',
          },
        });
      }
    }
  });

  // 2. Garis Garis Keturunan Generasi (Vertikal Smoothstep ke Anak)
  members.forEach((child) => {
    const parentId = child.father_id || child.mother_id;
    if (parentId && memberMap.has(parentId)) {
      const isPathEdge =
        pathSet.has(child.id) &&
        pathSet.has(parentId) &&
        Math.abs(highlightedPath.indexOf(child.id) - highlightedPath.indexOf(parentId)) === 1;

      const isEdgeDimmed = hasHighlight && !isPathEdge;

      edges.push({
        id: `lineage-${parentId}-${child.id}`,
        source: parentId,
        target: child.id,
        sourceHandle: 'bottom-child',
        targetHandle: 'top-parent',
        type: 'smoothstep',
        animated: isPathEdge,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: isPathEdge ? '#c2410c' : '#52525b',
        },
        style: {
          stroke: isPathEdge ? '#c2410c' : '#71717a',
          strokeWidth: isPathEdge ? 3.5 : 2,
          opacity: isEdgeDimmed ? 0.15 : 1,
          transition: 'all 0.3s ease',
        },
      });
    }

    // Cabang garis dari orang tua kedua jika keduanya terdaftar
    if (child.father_id && child.mother_id && memberMap.has(child.mother_id) && child.father_id !== child.mother_id) {
      const secondaryParentId = child.mother_id;
      const isPathEdge =
        pathSet.has(child.id) &&
        pathSet.has(secondaryParentId) &&
        Math.abs(highlightedPath.indexOf(child.id) - highlightedPath.indexOf(secondaryParentId)) === 1;

      const isEdgeDimmed = hasHighlight && !isPathEdge;

      edges.push({
        id: `lineage-${secondaryParentId}-${child.id}`,
        source: secondaryParentId,
        target: child.id,
        sourceHandle: 'bottom-child',
        targetHandle: 'top-parent',
        type: 'smoothstep',
        animated: isPathEdge,
        style: {
          stroke: isPathEdge ? '#c2410c' : '#a1a1aa',
          strokeWidth: isPathEdge ? 3 : 1.5,
          opacity: isEdgeDimmed ? 0.12 : 0.7,
          transition: 'all 0.3s ease',
        },
      });
    }
  });

  return { nodes, edges };
}
