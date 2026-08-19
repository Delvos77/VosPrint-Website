/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Phone, MapPin, CheckCircle2, ShieldCheck, Zap, HeartHandshake, HelpCircle, Edit3 } from 'lucide-react';
import { StoreHours } from '../types';

interface StoreInfoProps {
  storeHours?: StoreHours;
  role?: 'buyer' | 'moderator';
  onOpenEditStoreHours?: () => void;
}

export default function StoreInfo({ storeHours, role = 'buyer', onOpenEditStoreHours }: StoreInfoProps) {
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
      <div className="text-center space-y-2" id="store-info-header">
        <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">Informasi CetakInstan</h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Pusat percetakan digital dan offset terpercaya. Kami melayani kebutuhan banner, stiker label, brosur promo, kartu nama profesional, dan display booth instan dengan harga transparan.
        </p>
      </div>

      {/* 2. Grid Kontak & Jam Buka */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="store-contact-grid">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start justify-between shadow-2xs relative">
          <div className="flex items-start space-x-3.5">
            <Clock className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-800">Jam Operasional</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-semibold">{displayHours.openDays}:</p>
              <p className="text-[11px] font-extrabold text-amber-600">
                {displayHours.openTime} - {displayHours.closeTime} {displayHours.timezone || 'WIB'}
              </p>
              <p className="text-xs text-rose-500 mt-2 font-bold">Status Hari Libur:</p>
              <p className="text-[11px] text-slate-500">{displayHours.closedDaysInfo}</p>
            </div>
          </div>

          {role === 'moderator' && onOpenEditStoreHours && (
            <button
              onClick={onOpenEditStoreHours}
              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 underline flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded border border-amber-200 shrink-0 transition"
              title="Atur Jam Operasional Toko"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit Jam</span>
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start space-x-3.5 shadow-2xs">
          <Phone className="h-6 w-6 text-cyan-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Hubungi Kami</h3>
            <p className="text-xs text-slate-500 mt-1">Layanan WhatsApp Admin:</p>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5">+62 853-3949-9687</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
              Online Fast Response
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-start space-x-3.5 shadow-2xs">
          <MapPin className="h-6 w-6 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Alamat Toko</h3>
            <p className="text-xs text-slate-600 mt-1 font-semibold">CetakInstan Hub Jakarta</p>
            <p className="text-[11px] text-slate-500 leading-normal">
              Jl. Percetakan Negara No. 45, Paseban, Kec. Senen, Kota Jakarta Pusat, DKI Jakarta 10440
            </p>
          </div>
        </div>
      </div>

      {/* 3. Keunggulan Kami (Flat Cards, No complex nesting) */}
      <div className="space-y-4" id="store-benefits-section">
        <h3 className="text-base font-bold uppercase tracking-wider text-slate-500 text-center">Kenapa Memilih Kami?</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-center flex flex-col items-center">
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Kalkulator Harga Instan</h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Transparan! Hitung biaya custom cetak secara real-time langsung di web tanpa perlu menunggu penawaran manual.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-center flex flex-col items-center">
            <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Jaminan Mutu Hasil</h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Cetak dengan mesin digital offset termutakhir. Hasil cetakan tajam, cerah, presisi, dan tidak gampang luntur.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-center flex flex-col items-center">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Pemeriksaan File Gratis</h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Sebelum naik ke meja cetak, tim operator professional kami akan meninjau ulang resolusi & layout desain Anda.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-center flex flex-col items-center">
            <div className="rounded-full bg-rose-500/10 p-2 text-rose-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Alur WhatsApp Mudah</h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Checkout terintegrasi dengan draf rapi. Anda bisa diskusi detail pengiriman & bayar dengan aman via WA admin.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Frequently Asked Questions FAQ (Simple list layout) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-5" id="store-faqs-section">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <HelpCircle className="h-5 w-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-800">Pertanyaan Sering Diajukan (FAQ)</h3>
        </div>

        <div className="space-y-4 divider-y divider-slate-100" id="faqs-accordion">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-1.5" id={`faq-item-${index}`}>
              <h4 className="text-xs font-bold text-slate-800 flex items-start">
                <span className="text-amber-500 mr-1.5 font-extrabold">Q:</span>
                {faq.q}
              </h4>
              <p className="text-[11px] text-slate-500 pl-4 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
