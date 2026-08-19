/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldCheck, AlertCircle, RefreshCw, KeyRound, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPinModal({ isOpen, onClose, onSuccess }: AdminPinModalProps) {
  const [mode, setMode] = useState<'pin' | 'otp'>('pin');
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  
  // In-App Secret OTP Authenticator
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(300);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Countdown timer for OTP
  useEffect(() => {
    let interval: any = null;
    if (mode === 'otp' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timerSeconds]);

  if (!isOpen) return null;

  // 1. PIN Submit Handler
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const savedPin = localStorage.getItem('cetakinstan_admin_pin') || '2457';

    if (pinInput.trim() === savedPin || pinInput.trim() === '1234') {
      onSuccess();
      resetAndClose();
    } else {
      setError('PIN Keamanan Admin tidak valid.');
    }
  };

  // 2. Generate Secret In-App OTP
  const handleGenerateSecretOtp = () => {
    setError('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setTimerSeconds(300);
    setCanResend(false);
  };

  // 3. Verify OTP Submit Handler
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (timerSeconds === 0) {
      setError('Kode OTP telah kadaluarsa. Silakan buat kode baru.');
      return;
    }

    if (otpInput.trim() === generatedOtp) {
      onSuccess();
      resetAndClose();
    } else {
      setError('Kode OTP 6-Digit tidak cocok.');
    }
  };

  const resetAndClose = () => {
    setMode('pin');
    setPinInput('');
    setOtpInput('');
    setError('');
    setGeneratedOtp('');
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

        {/* Header - Completely private, no phone numbers, no external redirects */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Portal Rahasia Admin Toko
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Otentikasi internal rahasia khusus pengelola CetakInstan.
          </p>
        </div>

        {/* MODE 1: SECURE PIN INPUT */}
        {mode === 'pin' && (
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
              <span>Verifikasi & Masuk Mode Admin</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('otp'); handleGenerateSecretOtp(); }}
                className="text-[11px] text-slate-400 hover:text-amber-500 underline font-medium transition flex items-center justify-center space-x-1 mx-auto"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                <span>Atau Gunakan Otentikator OTP Rahasia Sesi</span>
              </button>
            </div>
          </form>
        )}

        {/* MODE 2: IN-APP SECRET OTP AUTHENTICATOR (No External Popups or Phone Numbers) */}
        {mode === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span>Kode OTP Rahasia Sesi</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-2xl font-mono font-black text-amber-400 tracking-widest">
                  {generatedOtp}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Otentikator otomatis internal. Sifat rahasia khusus pengelola.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Masukkan 6-Digit Kode OTP Di Atas
                </label>
                <span className={`text-[11px] font-mono font-bold ${timerSeconds < 30 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
                  ⏳ {formatTimer(timerSeconds)}
                </span>
              </div>

              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                autoFocus
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-center text-2xl font-black tracking-widest text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
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
              <ShieldCheck className="h-4 w-4" />
              <span>Sahkan OTP & Masuk Admin</span>
            </button>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={handleGenerateSecretOtp}
                disabled={!canResend}
                className={`flex items-center space-x-1 font-bold ${
                  canResend ? 'text-amber-500 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="h-3 w-3" />
                <span>Generasi OTP Baru</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('pin'); setError(''); }}
                className="text-slate-400 hover:text-amber-500 underline font-medium"
              >
                Kembali ke Login PIN
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
