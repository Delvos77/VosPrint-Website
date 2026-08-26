/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, Eye, EyeOff, ShieldAlert, CheckCircle2, Loader2, KeyRound, Timer, Clock, Hourglass, Shield, RefreshCw } from 'lucide-react';
import { 
  loginAdmin, 
  resetAdminLockout, 
  getLockoutDurationMinutes, 
  setLockoutDurationMinutes, 
  getRemainingCooldownSeconds, 
  triggerLockoutCooldown, 
  formatCooldownTime, 
  LOCKOUT_DURATION_OPTIONS, 
  LockoutDurationMinutes 
} from '../utils/adminAuth';

export interface BlockedClient {
  id: string;
  ipAlias: string;
  failedCount: number;
  blockedAt: string;
  isBlocked: boolean;
}

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPinModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminPinModalProps) {
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Cooldown & Delay State (30 Menit - 1 Hari)
  const [selectedDuration, setSelectedDuration] = useState<LockoutDurationMinutes>(getLockoutDurationMinutes());
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [showDurationSelector, setShowDurationSelector] = useState<boolean>(false);

  // Read and maintain blocked / failed attempts status on open
  useEffect(() => {
    if (isOpen) {
      const storedBlocked = localStorage.getItem('cetakinstan_is_blocked_moderator') === 'true';
      const storedFailed = parseInt(localStorage.getItem('cetakinstan_failed_pin_attempts') || '0', 10);
      const currentlyBlocked = storedBlocked || storedFailed >= 3;
      setIsBlocked(currentlyBlocked);
      setFailedCount(storedFailed);
      setPinInput('');
      setError('');

      const duration = getLockoutDurationMinutes();
      setSelectedDuration(duration);

      if (currentlyBlocked) {
        let remaining = getRemainingCooldownSeconds();
        if (remaining <= 0) {
          // Trigger initial cooldown if just blocked
          triggerLockoutCooldown(duration);
          remaining = getRemainingCooldownSeconds();
        }
        setCooldownRemaining(remaining);
      } else {
        setCooldownRemaining(0);
      }
    }
  }, [isOpen]);

  // Real-time countdown timer interval
  useEffect(() => {
    if (!isBlocked || !isOpen) return;

    // Immediately calculate remaining seconds
    const updateRemaining = () => {
      const remaining = getRemainingCooldownSeconds();
      setCooldownRemaining(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [isBlocked, isOpen]);

  if (!isOpen) return null;

  // Handle duration change
  const handleDurationChange = (newMinutes: LockoutDurationMinutes) => {
    setSelectedDuration(newMinutes);
    setLockoutDurationMinutes(newMinutes);
    if (isBlocked) {
      triggerLockoutCooldown(newMinutes);
      setCooldownRemaining(getRemainingCooldownSeconds());
    }
    setShowDurationSelector(false);
  };

  // PIN Submit Handler via Server-Side API
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pinInput.trim()) {
      setError('PIN/Password tidak boleh kosong.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAdmin(pinInput.trim());

      if (result.success) {
        setFailedCount(0);
        setIsBlocked(false);
        setCooldownRemaining(0);
        localStorage.removeItem('cetakinstan_lockout_until');
        localStorage.setItem('cetakinstan_failed_pin_attempts', '0');
        localStorage.setItem('cetakinstan_is_blocked_moderator', 'false');
        onSuccess();
        resetAndClose();
      } else {
        if (result.isBlocked) {
          setIsBlocked(true);
          setFailedCount(3);
          triggerLockoutCooldown(selectedDuration);
          setCooldownRemaining(getRemainingCooldownSeconds());
          localStorage.setItem('cetakinstan_is_blocked_moderator', 'true');
          localStorage.setItem('cetakinstan_failed_pin_attempts', '3');
          setError(result.message || 'PIN Salah 3x! Akses login Moderator diblokir.');
        } else {
          const remaining = result.remainingAttempts !== undefined ? result.remainingAttempts : Math.max(0, 3 - (failedCount + 1));
          const newFailed = 3 - remaining;
          setFailedCount(newFailed);
          localStorage.setItem('cetakinstan_failed_pin_attempts', newFailed.toString());
          if (newFailed >= 3) {
            setIsBlocked(true);
            triggerLockoutCooldown(selectedDuration);
            setCooldownRemaining(getRemainingCooldownSeconds());
            localStorage.setItem('cetakinstan_is_blocked_moderator', 'true');
          }
          setError(result.message || `PIN/Password Salah! Sisa percobaan login: ${remaining}x lagi.`);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan sistem saat verifikasi PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unblock action triggered after cooldown
  const handleUnblockAction = async () => {
    if (cooldownRemaining > 0) {
      setError(`Mohon tunggu jeda keamanan ${formatCooldownTime(cooldownRemaining)} sebelum membuka blokir.`);
      return;
    }

    setIsLoading(true);
    try {
      await resetAdminLockout();
      localStorage.removeItem('cetakinstan_lockout_until');
      setIsBlocked(false);
      setFailedCount(0);
      setCooldownRemaining(0);
      setError('');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAndClose = () => {
    setPinInput('');
    setError('');
    setIsLoading(false);
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

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border ${
            isBlocked
              ? 'bg-red-500/10 text-red-500 border-red-500/20'
              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            {isBlocked ? <ShieldAlert className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Portal Khusus Pengelola
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Akses server-side terproteksi khusus Owner & Moderator toko.
          </p>
        </div>

        {/* IS BLOCKED ALERT VIEW WITH COOLDOWN DELAY */}
        {isBlocked ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-center space-y-2.5">
              <div className="flex items-center justify-center space-x-1.5 text-red-600 dark:text-red-400 font-bold text-xs">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>AKSES MODERATOR TERBLOKIR</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Terjadi kesalahan input PIN sebanyak <strong>3 kali</strong>. Sistem menerapkan jeda proteksi untuk mencegah percobaan berulang.
              </p>

              {/* Real-time Cooldown Timer Card */}
              <div className="p-3 rounded-xl bg-slate-900/90 dark:bg-black/60 border border-amber-500/30 text-amber-400 space-y-1 shadow-inner">
                <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-slate-400">
                  <Hourglass className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>Sisa Jeda Waktu Keamanan:</span>
                </div>
                <div className="text-2xl font-black tracking-wider text-amber-400 font-mono">
                  {cooldownRemaining > 0 ? formatCooldownTime(cooldownRemaining) : '00m 00s (Selesai)'}
                </div>
                <p className="text-[10px] text-slate-400">
                  Durasi jeda aktif:{' '}
                  <strong className="text-amber-300">
                    {LOCKOUT_DURATION_OPTIONS.find(o => o.minutes === selectedDuration)?.label || `${selectedDuration} Menit`}
                  </strong>
                </p>
              </div>

              {/* Duration Settings Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDurationSelector(!showDurationSelector)}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-amber-500 flex items-center justify-center mx-auto space-x-1 transition font-medium"
                >
                  <Timer className="h-3 w-3" />
                  <span>Ubah Opsi Jeda (30 Menit - 1 Hari)</span>
                </button>

                {showDurationSelector && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-left">
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Pilih Durasi Jeda Penguncian:
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {LOCKOUT_DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.minutes}
                          type="button"
                          onClick={() => handleDurationChange(opt.minutes)}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                            selectedDuration === opt.minutes
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className="text-[10px] opacity-80">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Fitur Spectator (Pembeli) Tetap Normal</span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              {/* UNBLOCK BUTTON WITH COOLDOWN PROTECTION */}
              <button
                type="button"
                onClick={handleUnblockAction}
                disabled={isLoading || cooldownRemaining > 0}
                className={`w-full rounded-xl font-bold text-xs py-3.5 transition shadow flex items-center justify-center space-x-1.5 ${
                  cooldownRemaining > 0
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-md'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Membuka Akses...</span>
                  </>
                ) : cooldownRemaining > 0 ? (
                  <>
                    <Lock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Tunggu Jeda Keamanan ({formatCooldownTime(cooldownRemaining)})</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>Buka Blokir & Masukkan Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetAndClose}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs py-2.5 transition"
              >
                Kembali ke Website Spectator
              </button>
            </div>
          </div>
        ) : (
          /* SECURE PIN INPUT FORM */
          <form onSubmit={handlePinSubmit} className="space-y-4 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Masukkan PIN / Password Admin
                </label>
                {failedCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-500">
                    Percobaan: {failedCount}/3
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={30}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  disabled={isLoading}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3.5 pr-10 text-center text-xl font-black tracking-widest text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  disabled={isLoading}
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
              disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3.5 transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memverifikasi ke Server...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verifikasi & Masuk Mode Moderator</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

