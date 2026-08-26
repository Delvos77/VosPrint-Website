/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Phone, MapPin, Calendar, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { OrderRecord } from '../types';
import { formatIDR, WHATSAPP_NUMBER_DEFAULT } from '../data';
import VosPrintLogo from './VosPrintLogo';

interface InvoiceModalProps {
  order: OrderRecord;
  onClose: () => void;
  hideSensitiveData?: boolean;
}

export default function InvoiceModal({ order, onClose, hideSensitiveData = false }: InvoiceModalProps) {
  const formatPhone = (phone: string) => {
    if (!hideSensitiveData) return phone;
    if (phone.length <= 6) return '****';
    return `${phone.slice(0, 4)}-****-${phone.slice(-4)}`;
  };
  const handlePrint = () => {
    window.print();
  };

  const handleShareWa = () => {
    let msg = `*NOTA RESMI VOSPRINT*\n`;
    msg += `No. Nota: ${order.id}\n`;
    msg += `Nama: ${order.customerName}\n`;
    msg += `Total: ${formatIDR(order.totalAmount)}\n`;
    msg += `Status: ${order.status.toUpperCase()}\n\n`;
    msg += `Terima kasih telah memesan di vosprint!`;
    const url = `https://wa.me/${WHATSAPP_NUMBER_DEFAULT}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      id="invoice-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Main Invoice Card (Print-optimized) */}
      <motion.div
        id="invoice-printable-card"
        initial={{ y: 20, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-900 px-6 py-3.5 text-white">
          <div className="flex items-center space-x-2">
            <Printer className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-extrabold">Nota Resmi & Bukti Pesanan</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-1.5 px-3 shadow-xs transition"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              onClick={handleShareWa}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs py-1.5 px-3 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Kirim WA</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-slate-900 bg-white" id="invoice-content-area">
          
          {/* Header Branding & Nota Metadata */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-slate-900 pb-5 gap-4">
            <div>
              <VosPrintLogo size="lg" />
              <p className="text-xs text-slate-500 mt-2">Jl. Percetakan Negara No. 45, Paseban, Senen, Jakarta Pusat 10440</p>
              <p className="text-xs text-slate-500">WA: +62 853-3949-9687 | Email: order@vosprint.com</p>
            </div>

            <div className="text-left md:text-right space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="inline-block rounded-md bg-slate-900 px-2.5 py-1 text-xs font-black text-amber-400 uppercase tracking-widest">
                BUKTI PESANAN
              </span>
              <p className="text-sm font-black text-slate-900 mt-1">No: {order.id}</p>
              <p className="text-xs text-slate-600 font-medium">Tanggal: {new Date(order.createdAt).toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PEMESAN:</span>
              <p className="text-sm font-extrabold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 font-medium">WhatsApp: {formatPhone(order.whatsapp)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">METODE PENGAMBILAN:</span>
              <p className="text-xs font-extrabold text-slate-900">
                {order.deliveryMethod === 'pickup' ? '🛵 Ambil Mandiri di Toko' : '🚚 Pengiriman Kurir / Ekspedisi'}
              </p>
              {order.address && <p className="text-slate-600 leading-tight">Alamat: {order.address}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3">No</th>
                  <th className="p-3">Item Produk & Spesifikasi</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {order.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold">{idx + 1}</td>
                    <td className="p-3 space-y-0.5">
                      <p className="font-extrabold text-slate-900">{item.productName}</p>
                      <p className="text-[11px] text-slate-500">Bahan: {item.material.name}</p>
                      {item.width && item.length && (
                        <p className="text-[11px] text-slate-500">Ukuran: {item.width} x {item.length} m</p>
                      )}
                      {item.pages && (
                        <p className="text-[11px] text-slate-500">Jumlah Halaman: {item.pages} hlm</p>
                      )}
                      {item.finishing.length > 0 && (
                        <p className="text-[11px] text-slate-500">Finishing: {item.finishing.map(f => f.name).join(', ')}</p>
                      )}
                      {item.notes && (
                        <p className="text-[11px] italic text-slate-500">Catatan: "{item.notes}"</p>
                      )}
                    </td>
                    <td className="p-3 text-center font-bold">{item.quantity} {item.unit}</td>
                    <td className="p-3 text-right font-extrabold text-slate-900">{formatIDR(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Summary & Stamp */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
            {/* Stamp & Policy */}
            <div className="space-y-2 max-w-sm text-[11px] text-slate-500 border-l-2 border-amber-500 pl-3">
              <p className="font-bold text-slate-800">Catatan Transaksi:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Mohon periksa kembali kesesuaian file cetak Anda saat dikonfirmasi oleh operator.</li>
                <li>Proses pengerjaan dimulai setelah bukti pesanan diverifikasi.</li>
              </ul>
            </div>

            {/* Total Box */}
            <div className="w-full md:w-64 bg-slate-900 text-white p-4 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Total Belanja:</span>
                <span className="font-bold">{formatIDR(order.totalAmount)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-black text-amber-400">
                <span>TOTAL BAYAR:</span>
                <span>{formatIDR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-slate-600 border-t border-slate-200">
            <div>
              <p className="font-semibold mb-12">Hormat Kami (Operator vosprint)</p>
              <p className="font-bold text-slate-900">( ______________________ )</p>
            </div>
            <div>
              <p className="font-semibold mb-12">Penerima / Pemesan</p>
              <p className="font-bold text-slate-900">( {order.customerName} )</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
