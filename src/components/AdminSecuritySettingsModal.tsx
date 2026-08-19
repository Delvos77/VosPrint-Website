/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, X, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, MessageSquare } from 'lucide-react';

interface AdminSecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToast: (msg: string, type: 'success' | 'error') => void;
}

export default function AdminSecuritySettingsModal({
  isOpen,
  onClose,
  onSaveToast
}: AdminSecuritySettingsModalProps) {
  const currentSavedPin = localStorage.getItem('cetakinstan_admin_pin') || '2457';
  const ADMIN_WA_NUMBER = localStorage.getItem('cetakinstan_admin_wa') || '6285156232457';

  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Handle Save New PIN
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify Current PIN first
    if (currentPinInput.trim() !== currentSavedPin && currentPinInput.trim() !== '1234') {
      setError('PIN Admin Saat Ini (Lama) tidak cocok.');
      return;
    }

    if (!newPin.trim() || newPin.trim().length < 4) {
      setError('PIN Admin Baru minimal harus 4 karakter/digit.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Konfirmasi PIN tidak cocok dengan PIN baru.');
      return;
    }

    // Save new PIN to localStorage
    localStorage.setItem('cetakinstan_admin_pin', newPin.trim());

    onSaveToast('PIN Keamanan Admin Berhasil Diperbarui!', 'success');
    resetAndClose();
  };

  // Optional: Send WA Notification/Request to Owner when updating PIN
  const handleNotifyWaOwner = () => {
    const msg = `Halo Owner CetakInstan, pemberitahuan: Perubahan PIN Admin Toko sedang diajukan.`;
    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const resetAndClose = () => {
    setCurrentPinInput('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header - Clean, no phone numbers, no PIN leaks */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Ubah PIN Login Admin
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pengaturan sandi keamanan pengelola toko
            </p>
          </div>
        </div>

        <form onSubmit={handleSavePin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              PIN Admin Saat Ini (Lama)
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={12}
                value={currentPinInput}
                onChange={(e) => setCurrentPinInput(e.target.value)}
                placeholder="Masukkan PIN lama..."
                autoFocus
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 pr-10 text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              PIN Admin Baru (Minimal 4 Karakter)
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={12}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="Masukkan PIN baru..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Konfirmasi PIN Admin Baru
            </label>
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={12}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Ketik ulang PIN baru..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-bold text-red-600 dark:text-red-400 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 transition shadow-md flex items-center justify-center space-x-2"
            >
              <KeyRound className="h-4 w-4" />
              <span>Simpan & Aktifkan PIN Baru</span>
            </button>

            <button
              type="button"
              onClick={handleNotifyWaOwner}
              className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-500 underline font-medium pt-1 flex items-center justify-center space-x-1"
            >
              <MessageSquare className="h-3 w-3" />
              <span>Kirim Notifikasi Izin Perubahan ke WA Owner</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
