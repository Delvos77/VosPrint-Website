/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QrCode, Phone, MessageSquare, ExternalLink, Upload, RefreshCw, Check, Sparkles } from 'lucide-react';

interface WhatsAppQRCardProps {
  role?: 'buyer' | 'moderator';
}

export default function WhatsAppQRCard({ role = 'buyer' }: WhatsAppQRCardProps) {
  const [waNumber, setWaNumber] = useState<string>(() => {
    const saved = localStorage.getItem('cetakinstan_wa_number');
    if (!saved || saved.includes('0812')) {
      localStorage.setItem('cetakinstan_wa_number', '0853-3949-9687');
      return '0853-3949-9687';
    }
    return saved;
  });

  const [customQrImage, setCustomQrImage] = useState<string>(() => {
    return localStorage.getItem('cetakinstan_wa_qr_image') || '';
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempNumber, setTempNumber] = useState<string>(waNumber);

  const cleanWaNumber = waNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber.startsWith('0') ? '62' + cleanWaNumber.slice(1) : cleanWaNumber}?text=Halo%20Admin%20vosprint%2C%20saya%20ingin%20bertanya%20mengenai%20layanan%20cetak`;

  const handleSaveConfig = () => {
    setWaNumber(tempNumber);
    localStorage.setItem('cetakinstan_wa_number', tempNumber);
    setIsEditing(false);
  };

  const handleUploadQr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomQrImage(base64);
        localStorage.setItem('cetakinstan_wa_qr_image', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetQr = () => {
    setCustomQrImage('');
    localStorage.removeItem('cetakinstan_wa_qr_image');
  };

  return (
    <div className="relative rounded-2xl border border-emerald-500/30 bg-slate-950/90 backdrop-blur-md p-5 text-center shadow-2xl shadow-emerald-950/40 space-y-4 overflow-hidden group">
      {/* Decorative top ambient glow */}
      <div className="absolute -top-12 -right-12 h-28 w-28 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-extrabold text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>WHATSAPP CS FAST RESPONSE</span>
        </div>

        {role === 'moderator' && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center space-x-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 transition"
          >
            <span>{isEditing ? 'Tutup Edit' : '⚙️ Edit WA/QR'}</span>
          </button>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-white flex items-center justify-center space-x-1.5">
          <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Konsultasi & Kirim File Design</span>
        </h3>
        <p className="text-[11px] text-slate-300 font-medium">
          Scan QR Code di bawah atau klik tombol untuk langsung chat dengan Customer Service kami
        </p>
      </div>

      {/* Admin Edit Controls Panel */}
      {isEditing && (
        <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 text-left space-y-3 animate-fade-in text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nomor WA Admin</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempNumber}
                onChange={(e) => setTempNumber(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
              />
              <button
                onClick={handleSaveConfig}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 uppercase block">Ganti Gambar Barcode QR</label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1">
                <Upload className="h-3.5 w-3.5 text-emerald-400" />
                <span>Upload Barcode Baru</span>
                <input type="file" accept="image/*" onChange={handleUploadQr} className="hidden" />
              </label>

              {customQrImage && (
                <button
                  onClick={handleResetQr}
                  className="text-xs text-red-400 hover:text-red-300 underline flex items-center space-x-1"
                  title="Gunakan Barcode Default"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset Default</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="relative p-3 bg-white rounded-2xl border-2 border-emerald-500/40 shadow-xl shadow-emerald-950/50 group-hover:border-emerald-400 transition-all duration-300">
          {customQrImage ? (
            <img
              src={customQrImage}
              alt="WhatsApp QR Code Custom"
              className="w-36 h-36 md:w-40 md:h-40 object-contain rounded-lg"
            />
          ) : (
            /* Crisp SVG WhatsApp QR Code Matrix Representation */
            <div className="w-36 h-36 md:w-40 md:h-40 bg-white flex flex-col items-center justify-center relative p-1">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950" fill="currentColor">
                {/* Outer positioning corner squares */}
                <rect x="5" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="11" y="11" width="14" height="14" rx="2" fill="currentColor" />

                <rect x="69" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="75" y="11" width="14" height="14" rx="2" fill="currentColor" />

                <rect x="5" y="69" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="11" y="75" width="14" height="14" rx="2" fill="currentColor" />

                {/* QR Data Dots Pattern */}
                <rect x="36" y="8" width="6" height="6" rx="1" />
                <rect x="48" y="8" width="6" height="6" rx="1" />
                <rect x="58" y="8" width="6" height="6" rx="1" />

                <rect x="36" y="18" width="6" height="6" rx="1" />
                <rect x="48" y="18" width="6" height="6" rx="1" />
                <rect x="58" y="18" width="6" height="6" rx="1" />

                <rect x="8" y="36" width="6" height="6" rx="1" />
                <rect x="18" y="36" width="6" height="6" rx="1" />
                <rect x="36" y="36" width="6" height="6" rx="1" />
                <rect x="48" y="36" width="6" height="6" rx="1" />
                <rect x="68" y="36" width="6" height="6" rx="1" />
                <rect x="82" y="36" width="6" height="6" rx="1" />

                <rect x="8" y="48" width="6" height="6" rx="1" />
                <rect x="24" y="48" width="6" height="6" rx="1" />
                <rect x="36" y="48" width="6" height="6" rx="1" />
                <rect x="58" y="48" width="6" height="6" rx="1" />
                <rect x="74" y="48" width="6" height="6" rx="1" />
                <rect x="86" y="48" width="6" height="6" rx="1" />

                <rect x="14" y="58" width="6" height="6" rx="1" />
                <rect x="36" y="58" width="6" height="6" rx="1" />
                <rect x="48" y="58" width="6" height="6" rx="1" />
                <rect x="68" y="58" width="6" height="6" rx="1" />
                <rect x="82" y="58" width="6" height="6" rx="1" />

                <rect x="36" y="68" width="6" height="6" rx="1" />
                <rect x="48" y="68" width="6" height="6" rx="1" />
                <rect x="68" y="68" width="6" height="6" rx="1" />
                <rect x="82" y="68" width="6" height="6" rx="1" />

                <rect x="36" y="82" width="6" height="6" rx="1" />
                <rect x="58" y="82" width="6" height="6" rx="1" />
                <rect x="74" y="82" width="6" height="6" rx="1" />
                <rect x="86" y="82" width="6" height="6" rx="1" />
              </svg>

              {/* WhatsApp Logo Badge in Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-emerald-500 rounded-full p-1.5 shadow-md border-2 border-white flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white fill-white" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-1 flex items-center justify-center space-x-1 text-[9px] font-bold text-slate-600 uppercase tracking-tight">
            <QrCode className="h-3 w-3 text-emerald-600" />
            <span>Scan via Kamera / WA</span>
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="space-y-2 pt-1">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs py-2.5 px-4 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 transition-all duration-200 active:scale-98"
        >
          <MessageSquare className="h-4 w-4 text-white fill-white shrink-0" />
          <span>Klik untuk Chat WhatsApp</span>
          <ExternalLink className="h-3.5 w-3.5 text-white/80 shrink-0" />
        </a>

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
          <span className="flex items-center space-x-1">
            <Phone className="h-3 w-3 text-emerald-400" />
            <span>{waNumber}</span>
          </span>
          <span className="text-emerald-400 font-bold">Layanan Fast Response</span>
        </div>
      </div>
    </div>
  );
}
