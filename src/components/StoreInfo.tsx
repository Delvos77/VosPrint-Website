/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clock, Phone, MapPin, CheckCircle2, ShieldCheck, Zap, HeartHandshake, HelpCircle, Edit3, QrCode, X, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { StoreHours } from '../types';
import VosPrintLogo from './VosPrintLogo';

interface StoreInfoProps {
  storeHours?: StoreHours;
  role?: 'buyer' | 'moderator';
  onOpenEditStoreHours?: () => void;
}

export default function StoreInfo({ storeHours, role = 'buyer', onOpenEditStoreHours }: StoreInfoProps) {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const waNumber = '6285339499687';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin vosprint, saya ingin konsultasi pemesanan cetak.')}`;

  const displayHours = storeHours || {
    openDays: 'Senin - Sabtu',
    openTime: '08:00',
    closeTime: '20:00',
    closedDaysInfo: 'Minggu & Hari Libur Tutup',
    timezone: 'WIB'
  };
  const faqs = [
    {
      q: 'Bagaimana cara mengirim file desain saya?',
      a: 'Anda bisa memasukkan link Google Drive, Canva, Dropbox, atau WeTransfer di form pemesanan saat memilih produk. Pastikan akses link diatur ke "Siapa saja dengan link" (Public/Editor) agar tim operator kami dapat mengunduhnya secara langsung.'
    },
    {
      q: 'Format file apa saja yang direkomendasikan untuk dicetak?',
      a: 'Kami menyarankan menggunakan format PDF, CDR, PSD, AI, atau gambar beresolusi tinggi (PNG/JPEG) minimal 300 DPI. Menggunakan file berformat vektor sangat dianjurkan untuk hasil spanduk besar agar tidak pecah.'
    },
    {
      q: 'Berapa lama estimasi proses cetakan?',
      a: 'Proses cetak standard adalah 1 - 2 hari kerja setelah desain disetujui (ACC). Layanan Express/Sameday juga tersedia untuk kebutuhan mendadak, silakan koordinasikan langsung dengan admin kami via WhatsApp.'
    },
    {
      q: 'Apakah bisa dibantu pembuatan desain jika belum punya?',
      a: 'Bisa! Kami menyediakan jasa edit ringan gratis (seperti menambah teks atau menata logo), serta jasa desain layout professional berbayar dengan harga bersahabat. Silakan berikan catatan detail di form pemesanan Anda.'
    }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 space-y-8" id="store-info-view">
      {/* 1. Header Tentang Kami */}
      <div className="text-center space-y-3 flex flex-col items-center" id="store-info-header">
        <VosPrintLogo size="lg" className="justify-center" />
        <p className="text-sm text-neutral-300 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Pusat percetakan digital dan offset terpercaya. Kami melayani kebutuhan banner, stiker label, brosur promo, kartu nama profesional, dan display booth instan dengan harga transparan.
        </p>
      </div>

      {/* 2. Grid Kontak & Jam Buka */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="store-contact-grid">
        <div className="rounded-2xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#121316] p-5 flex flex-col items-start justify-between shadow-md dark:shadow-xl relative h-full">
          <div className="flex items-start space-x-3.5">
            <Clock className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white dark:text-white">Jam Operasional</h3>
              </div>
              <p className="text-xs text-neutral-300 dark:text-neutral-300 mt-1 font-semibold">{displayHours.openDays}:</p>
              <p className="text-[11px] font-extrabold text-amber-500 dark:text-amber-400">
                {displayHours.openTime} - {displayHours.closeTime} {displayHours.timezone || 'WIB'}
              </p>
              <p className="text-xs text-rose-400 dark:text-rose-400 mt-2 font-bold">Status Hari Libur:</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-400">{displayHours.closedDaysInfo}</p>
            </div>
          </div>

          {role === 'moderator' && onOpenEditStoreHours && (
            <button
              onClick={onOpenEditStoreHours}
              className="mt-4 text-[10px] font-bold text-amber-400 dark:text-[#FFCC00] hover:underline flex items-center space-x-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30 w-fit transition"
              title="Atur Jam Operasional Toko"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit Jam</span>
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#121316] p-5 flex flex-col justify-between shadow-md dark:shadow-xl relative overflow-hidden group h-full">
          <div className="flex items-start space-x-3.5">
            <Phone className="h-6 w-6 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white dark:text-white">Hubungi Kami</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-400 mt-1">Layanan WhatsApp Admin:</p>
              <a 
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-extrabold text-emerald-400 hover:text-emerald-300 mt-0.5 tracking-wide transition group/link"
              >
                <span>+62 853-3949-9687</span>
                <ExternalLink className="h-3 w-3 opacity-70 group-hover/link:opacity-100" />
              </a>
              <p className="text-[10px] text-emerald-400 dark:text-emerald-400 font-bold mt-1.5 flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                Online Fast Response
              </p>
            </div>
          </div>
          
          {/* Barcode / QR Code Layout */}
          <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-300 flex items-center gap-1">
                <QrCode className="h-3 w-3 text-emerald-400" />
                Scan QR WhatsApp
              </p>
              <p className="text-[9px] text-neutral-500 max-w-[125px] leading-tight">
                Scan dengan kamera HP atau klik untuk perbesar
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              className="bg-white p-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.15)] transform transition-all duration-300 hover:scale-105 border-2 border-emerald-500/30 flex items-center justify-center cursor-pointer group/qr"
              title="Klik untuk perbesar QR Code"
            >
              <QRCodeSVG 
                value={waUrl} 
                size={58} 
                bgColor="#ffffff" 
                fgColor="#111827" 
                level="M" 
                className="rounded"
              />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#121316] p-5 flex items-start space-x-3.5 shadow-md dark:shadow-xl h-full">
          <MapPin className="h-6 w-6 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-white dark:text-white">Alamat Toko</h3>
            <p className="text-xs text-neutral-300 dark:text-neutral-300 mt-1 font-semibold">vosprint Hub Jakarta</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-400 leading-normal">
              Jl. Percetakan Negara No. 45, Paseban, Kec. Senen, Kota Jakarta Pusat, DKI Jakarta 10440
            </p>
          </div>
        </div>
      </div>

      {/* 3. Keunggulan Kami (Flat Cards, Negative theme) */}
      <div className="space-y-4" id="store-benefits-section">
        <h3 className="text-base font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-400 text-center">Kenapa Memilih Kami?</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#14161b] p-4 space-y-2 text-center flex flex-col items-center shadow-xs">
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-400 dark:text-[#FFCC00]">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-white dark:text-white">Kalkulator Harga Instan</h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-400 leading-normal">
              Transparan! Hitung biaya custom cetak secara real-time langsung di web tanpa perlu menunggu penawaran manual.
            </p>
          </div>

          <div className="rounded-xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#14161b] p-4 space-y-2 text-center flex flex-col items-center shadow-xs">
            <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-400 dark:text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-white dark:text-white">Jaminan Mutu Hasil</h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-400 leading-normal">
              Cetak dengan mesin digital offset termutakhir. Hasil cetakan tajam, cerah, presisi, dan tidak gampang luntur.
            </p>
          </div>

          <div className="rounded-xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#14161b] p-4 space-y-2 text-center flex flex-col items-center shadow-xs">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-white dark:text-white">Pemeriksaan File Gratis</h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-400 leading-normal">
              Sebelum naik ke meja cetak, tim operator professional kami akan meninjau ulang resolusi & layout desain Anda.
            </p>
          </div>

          <div className="rounded-xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#14161b] p-4 space-y-2 text-center flex flex-col items-center shadow-xs">
            <div className="rounded-full bg-rose-500/10 p-2 text-rose-400 dark:text-rose-400">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-white dark:text-white">Alur WhatsApp Mudah</h4>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-400 leading-normal">
              Checkout terintegrasi dengan draf rapi. Anda bisa diskusi detail pengiriman & bayar dengan aman via WA admin.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Frequently Asked Questions FAQ (Negative theme) */}
      <div className="rounded-2xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#121316] p-5 md:p-6 space-y-5 shadow-md dark:shadow-xl" id="store-faqs-section">
        <div className="flex items-center space-x-2 border-b border-[#2e333d] dark:border-white/10 pb-2">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white dark:text-white">Pertanyaan Sering Diajukan (FAQ)</h3>
        </div>

        <div className="space-y-4" id="faqs-accordion">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-1.5 border-b border-white/5 dark:border-white/5 pb-3 last:border-0 last:pb-0" id={`faq-item-${index}`}>
              <h4 className="text-xs font-bold text-white dark:text-white flex items-start">
                <span className="text-amber-400 mr-1.5 font-extrabold">Q:</span>
                {faq.q}
              </h4>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-400 pl-4 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Zoom Modal */}
      {isQrModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div 
            className="bg-[#1c1e24] border border-white/10 rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm pt-1">
              <Phone className="h-4 w-4" />
              <span>WhatsApp Admin</span>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-inner inline-block">
              <QRCodeSVG 
                value={waUrl} 
                size={200} 
                bgColor="#ffffff" 
                fgColor="#111827" 
                level="Q" 
                className="rounded"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">+62 853-3949-9687</p>
              <p className="text-[11px] text-neutral-400">Arahkan kamera smartphone Anda ke QR code di atas.</p>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-md"
            >
              <span>Buka WhatsApp Langsung</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
