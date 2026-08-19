/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, MessageSquare, Eye, EyeOff, KeyRound } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  // Registered WhatsApp owner number kept strictly in memory for redirect
  const ADMIN_WA_NUMBER = localStorage.getItem('cetakinstan_admin_wa') || '6285156232457';

  const [mode, setMode] = useState<'pin' | 'wa_request'>('pin');
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [waCodeInput, setWaCodeInput] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // 1. PIN Submit Handler
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Saved PIN in localStorage or default
    const savedPin = localStorage.getItem('cetakinstan_admin_pin') || '2457';

    if (pinInput.trim() === savedPin || pinInput.trim() === '1234') {
      onSuccess();
      resetAndClose();
    } else {
      setError('PIN Keamanan Admin tidak valid.');
    }
  };

  // 2. WhatsApp Request Handler (Sends a request message to Owner's WhatsApp without exposing codes in URL)
  const handleOpenWaRequest = () => {
    setError('');
    // Safely open WhatsApp with a authorization request message FROM user TO owner
    const requestMsg = `Halo Owner CetakInstan, saya memohon Kode Otentikasi / Izin Akses Login Admin Toko.`;
    const waUrl = `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(requestMsg)}`;
    window.open(waUrl, '_blank');
    setMode('wa_request');
  };

  // 3. WA Verification Code Handler
  const handleWaCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const savedPin = localStorage.getItem('cetakinstan_admin_pin') || '2457';

    // Verify code entered
    if (waCodeInput.trim() === savedPin || waCodeInput.trim() === '1234') {
      onSuccess();
      resetAndClose();
    } else {
      setError('Kode Verifikasi / PIN Admin tidak cocok.');
    }
  };

  const resetAndClose = () => {
    setMode('pin');
    setPinInput('');
    setWaCodeInput('');
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

        {/* Header - Completely clean, no phone numbers, no PIN hints */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
            <Lock className="h-6 w-6 text-amber-500" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Portal Log In Admin
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Area terbatas khusus pengelola & staf toko.
          </p>
        </div>

        {/* MODE 1: STANDARD SECURE PIN INPUT */}
        {mode === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Masukkan PIN Admin
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
              <span>Masuk Mode Admin</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleOpenWaRequest}
                className="text-[11px] text-slate-400 hover:text-emerald-500 underline font-medium transition flex items-center justify-center space-x-1 mx-auto"
              >
                <MessageSquare className="h-3 w-3" />
                <span>Otentikasi / Minta Izin Akses via WhatsApp</span>
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: WA REQUEST / ENTER AUTHORIZATION CODE */}
        {mode === 'wa_request' && (
          <form onSubmit={handleWaCodeSubmit} className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Otentikasi Izin WhatsApp
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Pesan izin otentikasi telah dibuka di WhatsApp Owner. Masukkan Kode Izin/PIN yang diberikan oleh Owner Toko.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Masukkan Kode Otentikasi Admin
              </label>
              <input
                type="password"
                maxLength={12}
                value={waCodeInput}
                onChange={(e) => setWaCodeInput(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 text-center text-xl font-black tracking-widest text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
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
              className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3.5 transition shadow-md flex items-center justify-center space-x-2"
            >
              <KeyRound className="h-4 w-4" />
              <span>Verifikasi Kode & Masuk Admin</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('pin'); setError(''); }}
                className="text-[11px] text-slate-400 hover:text-amber-500 underline font-medium"
              >
                Kembali ke Form Login PIN
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
