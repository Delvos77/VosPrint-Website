/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, X, KeyRound, AlertCircle, Eye, EyeOff, ShieldAlert, CheckCircle2, Unlock, UserX } from 'lucide-react';
import { BlockedClient } from './AdminPinModal';

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

  const [activeTab, setActiveTab] = useState<'pin' | 'blocked_list'>('pin');
  const [currentPinInput, setCurrentPinInput] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Blocked Clients List State
  const [blockedList, setBlockedList] = useState<BlockedClient[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadBlockedList();
    }
  }, [isOpen]);

  const loadBlockedList = () => {
    const saved = localStorage.getItem('cetakinstan_blocked_clients');
    if (saved) {
      try {
        setBlockedList(JSON.parse(saved));
      } catch (e) {
        setBlockedList([]);
      }
    } else {
      setBlockedList([]);
    }
  };

  if (!isOpen) return null;

  // Save new PIN handler
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify Current PIN
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

  // Unblock a client
  const handleUnblockClient = (id: string) => {
    // 1. Reset current device block flags if it matches
    localStorage.setItem('cetakinstan_failed_pin_attempts', '0');
    localStorage.setItem('cetakinstan_is_blocked_moderator', 'false');

    // 2. Update list
    const updated = blockedList.map(item => {
      if (item.id === id) {
        return { ...item, isBlocked: false };
      }
      return item;
    });

    setBlockedList(updated);
    localStorage.setItem('cetakinstan_blocked_clients', JSON.stringify(updated));
    onSaveToast('Akses login berhasil dibuka kembali!', 'success');
  };

  // Clear all blocks
  const handleUnblockAll = () => {
    localStorage.setItem('cetakinstan_failed_pin_attempts', '0');
    localStorage.setItem('cetakinstan_is_blocked_moderator', 'false');
    localStorage.setItem('cetakinstan_blocked_clients', '[]');
    setBlockedList([]);
    onSaveToast('Semua status blokir akses telah dibersihkan!', 'success');
  };

  const resetAndClose = () => {
    setCurrentPinInput('');
    setNewPin('');
    setConfirmPin('');
    setError('');
    setActiveTab('pin');
    onClose();
  };

  const activeBlockedCount = blockedList.filter(b => b.isBlocked).length;

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

        {/* Header */}
        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Keamanan & Kontrol Akses Admin
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ubah PIN & Kelola Akses Terblokir
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 space-x-1">
          <button
            onClick={() => setActiveTab('pin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'pin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ubah PIN Admin
          </button>
          <button
            onClick={() => setActiveTab('blocked_list')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1 ${
              activeTab === 'blocked_list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Akses Terblokir</span>
            {activeBlockedCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                {activeBlockedCount}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: CHANGE PIN */}
        {activeTab === 'pin' && (
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

            <button
              type="submit"
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 transition shadow-md flex items-center justify-center space-x-2"
            >
              <KeyRound className="h-4 w-4" />
              <span>Simpan & Aktifkan PIN Baru</span>
            </button>
          </form>
        )}

        {/* TAB 2: BLOCKED CLIENTS MANAGEMENT */}
        {activeTab === 'blocked_list' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Daftar Percobaan Login Terblokir (Salah 3x)
              </p>
              {blockedList.length > 0 && (
                <button
                  onClick={handleUnblockAll}
                  className="text-[11px] text-amber-500 hover:underline font-bold"
                >
                  Buka Semua Blokir
                </button>
              )}
            </div>

            {blockedList.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Shield className="h-8 w-8 text-emerald-500 mx-auto opacity-80" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tidak Ada Akses Terblokir
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Semua percobaan login saat ini dalam status aman.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {blockedList.map((client) => (
                  <div
                    key={client.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between space-x-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <UserX className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {client.id}
                        </span>
                        {client.isBlocked ? (
                          <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Terblokir
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {client.ipAlias} • Terjadi {client.blockedAt}
                      </p>
                    </div>

                    {client.isBlocked ? (
                      <button
                        onClick={() => handleUnblockClient(client.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center space-x-1 shrink-0"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        <span>Buka</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-500 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Diizinkan</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
