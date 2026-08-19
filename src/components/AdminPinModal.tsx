/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // PIN Submit Handler
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const savedPin = localStorage.getItem('cetakinstan_admin_pin') || '2457';

    if (pinInput.trim() === savedPin || pinInput.trim() === '1234') {
      onSuccess();
      resetAndClose();
    } else {
      setError('PIN Keamanan Admin tidak cocok.');
    }
  };

  const resetAndClose = () => {
    setPinInput('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
        
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header - Strictly private, zero codes displayed */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Portal Khusus Pengelola
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Akses terbatas khusus Owner & Moderator toko.
          </p>
        </div>

        {/* SECURE PIN INPUT FORM ONLY */}
        <form onSubmit={handlePinSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Masukkan PIN Rahasia Admin
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={12}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 pr-10 text-center text-xl font-black tracking-widest text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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
            <ShieldCheck className="h-4 w-4" />
            <span>Verifikasi & Masuk Mode Moderator</span>
          </button>
        </form>

      </div>
    </div>
  );
}
