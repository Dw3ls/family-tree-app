'use client';

import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, X, AlertCircle, Loader2 } from 'lucide-react';
import { familyService } from '../services/familyService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    try {
      const ok = await familyService.loginAdmin(password);
      if (ok) {
        onSuccess();
        setPassword('');
        setError(false);
        onClose();
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-sm overflow-hidden p-6 animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <div className="p-2 rounded-xl bg-zinc-100 text-darkorange-700 border border-zinc-200">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-zinc-900">
          Masuk Mode Admin Silsilah
        </h3>
        <p className="text-xs text-zinc-500 mt-1 mb-4 leading-relaxed">
          Mode admin memberikan akses untuk menambah anggota keluarga baru, memperbarui biografi, foto, dan mengelola garis silsilah.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Kata Sandi Admin
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoFocus
                disabled={isLoading}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Masukkan kata sandi (demo: admin123)"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 focus:ring-1 focus:ring-zinc-900 outline-none"
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Kata sandi salah. Gunakan sandi demo: &quot;admin123&quot;.
              </p>
            )}
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-[11px] text-zinc-700">
            <span className="font-bold">Kode Akses Demo:</span> Ketik <code className="bg-zinc-200 px-1 py-0.5 rounded font-mono font-bold text-zinc-900">admin123</code>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl shadow-soft-sm flex items-center gap-1.5 transition border border-zinc-800"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-darkorange-400" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-darkorange-400" />
              )}
              <span>{isLoading ? 'Memverifikasi...' : 'Buka Akses Admin'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
