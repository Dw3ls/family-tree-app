import { FamilyMember, RelationshipResult, RelationshipStep } from '../types/family';

interface GraphEdge {
  to: string;
  type: 'parent' | 'child' | 'spouse';
  label: string;
}

export function buildAdjacencyList(members: FamilyMember[]): Map<string, GraphEdge[]> {
  const adj = new Map<string, GraphEdge[]>();
  const memberMap = new Map<string, FamilyMember>();

  members.forEach((m) => {
    adj.set(m.id, []);
    memberMap.set(m.id, m);
  });

  members.forEach((m) => {
    // Jalur orang tua
    if (m.father_id && memberMap.has(m.father_id)) {
      adj.get(m.id)?.push({ to: m.father_id, type: 'parent', label: 'Ayah' });
      adj.get(m.father_id)?.push({
        to: m.id,
        type: 'child',
        label: m.gender === 'male' ? 'Anak Laki-laki' : 'Anak Perempuan',
      });
    }
    if (m.mother_id && memberMap.has(m.mother_id)) {
      adj.get(m.id)?.push({ to: m.mother_id, type: 'parent', label: 'Ibu' });
      adj.get(m.mother_id)?.push({
        to: m.id,
        type: 'child',
        label: m.gender === 'male' ? 'Anak Laki-laki' : 'Anak Perempuan',
      });
    }
    // Jalur pernikahan
    if (m.spouse_id && memberMap.has(m.spouse_id)) {
      const spouse = memberMap.get(m.spouse_id);
      const isAlreadyLinked = adj.get(m.id)?.some((e) => e.to === m.spouse_id);
      if (!isAlreadyLinked) {
        adj.get(m.id)?.push({
          to: m.spouse_id,
          type: 'spouse',
          label: spouse?.gender === 'female' ? 'Istri' : 'Suami',
        });
        adj.get(m.spouse_id)?.push({
          to: m.id,
          type: 'spouse',
          label: m.gender === 'female' ? 'Istri' : 'Suami',
        });
      }
    }
  });

  return adj;
}

// Mencari rute terpendek dengan BFS
export function findShortestPath(
  startId: string,
  endId: string,
  adj: Map<string, GraphEdge[]>
): string[] | null {
  if (startId === endId) return [startId];

  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const parentMap = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === endId) {
      const path: string[] = [];
      let curr: string | undefined = endId;
      while (curr) {
        path.unshift(curr);
        curr = parentMap.get(curr);
      }
      return path;
    }

    const neighbors = adj.get(current) || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        parentMap.set(edge.to, current);
        queue.push(edge.to);
      }
    }
  }

  return null;
}

// Ambil leluhur dan jarak generasi
function getAncestors(
  memberId: string,
  memberMap: Map<string, FamilyMember>
): Map<string, number> {
  const ancestors = new Map<string, number>();
  const queue: { id: string; dist: number }[] = [{ id: memberId, dist: 0 }];

  while (queue.length > 0) {
    const { id, dist } = queue.shift()!;
    const member = memberMap.get(id);
    if (!member) continue;

    if (dist > 0) {
      ancestors.set(id, dist);
    }

    if (member.father_id && memberMap.has(member.father_id)) {
      queue.push({ id: member.father_id, dist: dist + 1 });
    }
    if (member.mother_id && memberMap.has(member.mother_id)) {
      queue.push({ id: member.mother_id, dist: dist + 1 });
    }
  }

  return ancestors;
}

export function calculateRelationship(
  personAId: string,
  personBId: string,
  members: FamilyMember[]
): RelationshipResult {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const personA = memberMap.get(personAId);
  const personB = memberMap.get(personBId);

  if (!personA || !personB) {
    return {
      personAId,
      personBId,
      title: 'Tidak Ditemukan',
      description: 'Salah satu atau kedua anggota keluarga tidak ditemukan.',
      path: [],
      steps: [],
    };
  }

  if (personAId === personBId) {
    return {
      personAId,
      personBId,
      title: 'Orang yang Sama',
      description: `${personA.full_name} adalah individu yang sama.`,
      path: [personAId],
      steps: [],
    };
  }

  const adj = buildAdjacencyList(members);
  const path = findShortestPath(personAId, personBId, adj) || [];

  // Langkah demi langkah
  const steps: RelationshipStep[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const fromMember = memberMap.get(fromId)!;
    const toMember = memberMap.get(toId)!;
    const edge = (adj.get(fromId) || []).find((e) => e.to === toId);

    const relLabel = edge ? edge.label : 'Kerabat';
    steps.push({
      fromId,
      toId,
      relationship: relLabel,
      detail: `${toMember.full_name} (${relLabel} dari ${fromMember.full_name})`,
    });
  }

  // 1. Hubungan Pasangan Langsung (Suami/Istri)
  if (personA.spouse_id === personBId || personB.spouse_id === personAId) {
    const title = personB.gender === 'female' ? 'Istri' : 'Suami';
    return {
      personAId,
      personBId,
      title,
      description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name}.`,
      path,
      steps,
    };
  }

  // 2. Hubungan Orang Tua & Anak Langsung
  if (personB.father_id === personAId || personB.mother_id === personAId) {
    const title = personB.gender === 'female' ? 'Anak Perempuan' : 'Anak Laki-laki';
    return {
      personAId,
      personBId,
      title,
      description: `${personB.full_name} adalah ${title.toLowerCase()} kandung dari ${personA.full_name}.`,
      path,
      steps,
    };
  }
  if (personA.father_id === personBId || personA.mother_id === personBId) {
    const title = personB.gender === 'female' ? 'Ibu Kandung' : 'Ayah Kandung';
    return {
      personAId,
      personBId,
      title,
      description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name}.`,
      path,
      steps,
    };
  }

  // Analisis Leluhur (Ancestors)
  const ancestorsA = getAncestors(personAId, memberMap);
  const ancestorsB = getAncestors(personBId, memberMap);

  // Jika B adalah leluhur A (Kakek/Nenek, Buyut)
  if (ancestorsA.has(personBId)) {
    const dist = ancestorsA.get(personBId)!;
    let title = '';
    if (dist === 2) {
      title = personB.gender === 'female' ? 'Nenek' : 'Kakek';
    } else if (dist === 3) {
      title = personB.gender === 'female' ? 'Nenek Buyut' : 'Kakek Buyut';
    } else {
      title = personB.gender === 'female' ? 'Leluhur Putri' : 'Leluhur Putra';
    }
    return {
      personAId,
      personBId,
      title,
      description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name} (terpaut ${dist} generasi di atas).`,
      path,
      steps,
    };
  }

  // Jika A adalah leluhur B (Cucu, Cicit)
  if (ancestorsB.has(personAId)) {
    const dist = ancestorsB.get(personAId)!;
    let title = '';
    if (dist === 2) {
      title = personB.gender === 'female' ? 'Cucu Perempuan' : 'Cucu Laki-laki';
    } else if (dist === 3) {
      title = personB.gender === 'female' ? 'Cicit Perempuan' : 'Cicit Laki-laki';
    } else {
      title = 'Keturunan';
    }
    return {
      personAId,
      personBId,
      title,
      description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name} (terpaut ${dist} generasi di bawah).`,
      path,
      steps,
    };
  }

  // Cari Leluhur Bersama (Common Ancestor) terdekat
  let commonAncestorId: string | undefined;
  let minSum = Infinity;

  ancestorsA.forEach((distA, id) => {
    if (ancestorsB.has(id)) {
      const distB = ancestorsB.get(id)!;
      const sum = distA + distB;
      if (sum < minSum) {
        minSum = sum;
        commonAncestorId = id;
      }
    }
  });

  if (commonAncestorId) {
    const distA = ancestorsA.get(commonAncestorId)!;
    const distB = ancestorsB.get(commonAncestorId)!;
    const anc = memberMap.get(commonAncestorId)!;

    // Jarak 1 & 1 -> Saudara Kandung
    if (distA === 1 && distB === 1) {
      const isFull =
        personA.father_id === personB.father_id &&
        personA.mother_id === personB.mother_id;
      const title =
        personB.gender === 'female'
          ? isFull
            ? 'Saudara Kandung Perempuan'
            : 'Saudara Perempuan Sebapak/Seibu'
          : isFull
          ? 'Saudara Kandung Laki-laki'
          : 'Saudara Laki-laki Sebapak/Seibu';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name} (orang tua bersama: ${anc.full_name}).`,
        path,
        steps,
        commonAncestorId,
      };
    }

    // distA = 1, distB = 2 -> B adalah Keponakan dari A
    if (distA === 1 && distB === 2) {
      const title = personB.gender === 'female' ? 'Keponakan Perempuan' : 'Keponakan Laki-laki';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name}.`,
        path,
        steps,
        commonAncestorId,
      };
    }

    // distA = 2, distB = 1 -> B adalah Paman / Bibi dari A
    if (distA === 2 && distB === 1) {
      const title = personB.gender === 'female' ? 'Bibi (Tante)' : 'Paman (Om)';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name}.`,
        path,
        steps,
        commonAncestorId,
      };
    }

    // distA = 2, distB = 2 -> Saudara Sepupu (First Cousin)
    if (distA === 2 && distB === 2) {
      const title = 'Saudara Sepupu';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah saudara sepupu dari ${personA.full_name} (kakek/nenek bersama: ${anc.full_name}).`,
        path,
        steps,
        commonAncestorId,
      };
    }

    // distA = 2, distB = 3 atau sebaliknya -> Sepupu Beda Generasi (Once Removed)
    if ((distA === 2 && distB === 3) || (distA === 3 && distB === 2)) {
      const title = 'Saudara Sepupu Satu Tingkat';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah sepupu tingkat satu beda generasi dengan ${personA.full_name}.`,
        path,
        steps,
        commonAncestorId,
      };
    }

    // distA = 3, distB = 3 -> Sepupu Derajat Dua
    if (distA === 3 && distB === 3) {
      const title = 'Saudara Sepupu Dua Kali';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah sepupu derajat dua dari ${personA.full_name}.`,
        path,
        steps,
        commonAncestorId,
      };
    }
  }

  // 4. Hubungan Mertua & Ipar
  if (personA.spouse_id) {
    const spouse = memberMap.get(personA.spouse_id);
    if (spouse) {
      if (personB.id === spouse.father_id) {
        return {
          personAId,
          personBId,
          title: 'Ayah Mertua',
          description: `${personB.full_name} adalah ayah mertua dari ${personA.full_name} (ayah dari ${spouse.full_name}).`,
          path,
          steps,
        };
      }
      if (personB.id === spouse.mother_id) {
        return {
          personAId,
          personBId,
          title: 'Ibu Mertua',
          description: `${personB.full_name} adalah ibu mertua dari ${personA.full_name} (ibu dari ${spouse.full_name}).`,
          path,
          steps,
        };
      }
      // Saudara kandung pasangan -> Ipar
      if (
        (spouse.father_id && spouse.father_id === personB.father_id) ||
        (spouse.mother_id && spouse.mother_id === personB.mother_id)
      ) {
        const title = personB.gender === 'female' ? 'Saudara Ipar Perempuan' : 'Saudara Ipar Laki-laki';
        return {
          personAId,
          personBId,
          title,
          description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name} (saudara kandung ${spouse.full_name}).`,
          path,
          steps,
        };
      }
    }
  }

  // Pasangan dari saudara kandung -> Ipar
  if (personB.spouse_id) {
    const bSpouse = memberMap.get(personB.spouse_id);
    if (
      bSpouse &&
      ((personA.father_id && personA.father_id === bSpouse.father_id) ||
        (personA.mother_id && personA.mother_id === bSpouse.mother_id))
    ) {
      const title = personB.gender === 'female' ? 'Saudara Ipar Perempuan' : 'Saudara Ipar Laki-laki';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name} (menikah dengan saudara kandung ${personA.full_name}, yaitu ${bSpouse.full_name}).`,
        path,
        steps,
      };
    }
  }

  // Pasangan dari anak -> Menantu
  for (const m of members) {
    if (
      (m.father_id === personAId || m.mother_id === personAId) &&
      m.spouse_id === personBId
    ) {
      const title = personB.gender === 'female' ? 'Menantu Perempuan' : 'Menantu Laki-laki';
      return {
        personAId,
        personBId,
        title,
        description: `${personB.full_name} adalah ${title.toLowerCase()} dari ${personA.full_name} (menikah dengan anak kandung ${m.full_name}).`,
        path,
        steps,
      };
    }
  }

  // Hubungan Garis Keluarga Umum
  if (path.length > 0) {
    return {
      personAId,
      personBId,
      title: 'Kerabat Garis Keturunan',
      description: `${personB.full_name} dan ${personA.full_name} terhubung melalui garis silsilah keluarga besar (${path.length - 1} mata rantai keluarga).`,
      path,
      steps,
    };
  }

  return {
    personAId,
    personBId,
    title: 'Tidak Ada Jalur Langsung',
    description: `Tidak ditemukan hubungan langsung atau pernikahan terdekat antara ${personA.full_name} dan ${personB.full_name}.`,
    path: [],
    steps: [],
  };
}
