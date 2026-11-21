'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FamilyMember } from '../types/family';
import { Search, MapPin, X } from 'lucide-react';

interface SearchAutocompleteProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  members,
  onSelectMember,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredMembers = query.trim()
    ? members.filter((m) => {
        const q = query.toLowerCase();
        return (
          m.full_name.toLowerCase().includes(q) ||
          (m.nickname && m.nickname.toLowerCase().includes(q)) ||
          (m.current_city && m.current_city.toLowerCase().includes(q)) ||
          (m.origin_city && m.origin_city.toLowerCase().includes(q))
        );
      })
    : [];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (member: FamilyMember) => {
    onSelectMember(member);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs md:max-w-sm">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Cari nama, panggilan, atau kota..."
          className="w-full bg-zinc-100 hover:bg-zinc-50 focus:bg-white text-zinc-900 placeholder:text-zinc-400 rounded-full pl-9 pr-8 py-2 text-xs font-medium border border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Hasil Pencarian Otomatis */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-soft-lg border border-zinc-200 overflow-hidden z-50 max-h-80 overflow-y-auto">
          {filteredMembers.length > 0 ? (
            <div className="p-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Hasil Pencarian ({filteredMembers.length})
              </div>
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelect(member)}
                  className="w-full text-left px-3 py-2 hover:bg-zinc-50 rounded-xl flex items-center gap-3 transition group"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 shrink-0 border border-zinc-200">
                    {member.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo_url}
                        alt={member.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-zinc-800 text-white">
                        {member.full_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900 group-hover:text-darkorange-700 truncate">
                        {member.full_name}
                      </span>
                      {member.nickname && (
                        <span className="text-[11px] text-zinc-500 font-medium">
                          &quot;{member.nickname}&quot;
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span>Gen {member.generation}</span>
                      {member.current_city && (
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5" />
                          {member.current_city}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-zinc-500">
              Tidak ditemukan anggota keluarga dengan kata kunci &quot;{query}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
