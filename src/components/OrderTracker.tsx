/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Clock, CheckCircle2, Shield, ShieldCheck, AlertCircle, 
  FileText, Lock, KeyRound, Smartphone, UserCheck, Filter, ArrowUpDown, 
  AlertTriangle, Check, Layers, ChevronDown, RefreshCw 
} from 'lucide-react';
import { motion } from 'motion/react';
import { OrderRecord, OrderStatus } from '../types';
import { formatIDR } from '../data';
import InvoiceModal from './InvoiceModal';

interface OrderTrackerProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  role: 'buyer' | 'moderator';
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Menunggu Konfirmasi', desc: 'Pesanan telah diterima & menunggu verifikasi pembayaran' },
  { key: 'checking_file', label: 'Pengecekan File', desc: 'Operator sedang mengecek resolusi & format file desain' },
  { key: 'printing', label: 'Proses Cetak Mesin', desc: 'Pesanan sedang dicetak dengan mesin digital/offset' },
  { key: 'finishing', label: 'Finishing & Pemotongan', desc: 'Proses mata ayam, laminasi, lipat lem, atau potong' },
  { key: 'ready', label: 'Siap Diambil / Dikirim', desc: 'Pesanan selesai & siap diambil di toko / dikirim kurir' },
  { key: 'completed', label: 'Selesai', desc: 'Pesanan telah diterima oleh pemesan' }
];

function getRelativeTimeString(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs)) return dateStr;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'Baru saja (< 1 mnt)';
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return 'Kemarin';
  if (diffDay < 30) return `${diffDay} hr lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export default function OrderTracker({ orders, onUpdateOrderStatus, role }: OrderTrackerProps) {
  // Device order IDs from localStorage
  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cetakinstan_my_order_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return ['INV-20260819-001'];
    } catch (e) {
      return ['INV-20260819-001'];
    }
  });

  // Buyer sub-tab: 'my_orders' | 'lookup'
  const [buyerSubTab, setBuyerSubTab] = useState<'my_orders' | 'lookup'>('my_orders');

  // Lookup form state
  const [lookupInvoice, setLookupInvoice] = useState<string>('');
  const [lookupPhoneKey, setLookupPhoneKey] = useState<string>('');
  const [lookupError, setLookupError] = useState<string>('');
  const [verifiedInvoiceId, setVerifiedInvoiceId] = useState<string | null>(null);

  // Admin Filtering & Sorting States
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [timeRangeFilter, setTimeRangeFilter] = useState<'all' | '1h' | 'today' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Selected order ID for right detail view (reactive)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeInvoiceOrderId, setActiveInvoiceOrderId] = useState<string | null>(null);

  // Device-only orders for Buyer Mode
  const myDeviceOrdersList = orders.filter((o) => myOrderIds.includes(o.id));

  // Pending / Holding orders count (pesanan tertahan di proses/pengiriman)
  const stuckOrdersCount = orders.filter((o) => o.status !== 'completed').length;
  const deliveryStuckCount = orders.filter((o) => o.status === 'ready' || o.status === 'finishing').length;

  // Filtered & Sorted orders for Admin Mode
  const adminFilteredOrders = orders
    .filter((o) => {
      // 1. Text Search
      const q = adminSearchQuery.toLowerCase().trim();
      const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.whatsapp.includes(q);
      if (!matchSearch) return false;

      // 2. Status Filter
      if (statusFilter === 'stuck') {
        // Tertahan: belum selesai (termasuk fase pengiriman/finishing)
        if (o.status === 'completed') return false;
      } else if (statusFilter === 'ready_delivery') {
        // Khusus Tertahan di Fase Pengiriman / Pengambilan
        if (o.status !== 'ready') return false;
      } else if (statusFilter !== 'all') {
        if (o.status !== statusFilter) return false;
      }

      // 3. Time Filter
      const orderTime = new Date(o.createdAt).getTime();
      const now = new Date().getTime();
      if (timeRangeFilter === '1h') {
        if (now - orderTime > 60 * 60 * 1000) return false;
      } else if (timeRangeFilter === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (orderTime < todayStart.getTime()) return false;
      } else if (timeRangeFilter === 'month') {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        if (orderTime < monthStart) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Determine active selected order reactively from latest orders prop
  const selectedOrder: OrderRecord | null = React.useMemo(() => {
    if (selectedOrderId) {
      const match = orders.find((o) => o.id === selectedOrderId);
      if (match) return match;
    }
    if (role === 'moderator') {
      if (adminFilteredOrders.length > 0) return adminFilteredOrders[0];
      return orders.length > 0 ? orders[0] : null;
    } else {
      return myDeviceOrdersList.length > 0 ? myDeviceOrdersList[0] : (orders.length > 0 ? orders[0] : null);
    }
  }, [orders, selectedOrderId, role, myDeviceOrdersList, adminFilteredOrders]);

  // Determine active verified order for lookup reactively
  const verifiedOrder: OrderRecord | null = React.useMemo(() => {
    if (verifiedInvoiceId) {
      return orders.find((o) => o.id.toUpperCase() === verifiedInvoiceId.toUpperCase()) || null;
    }
    return null;
  }, [orders, verifiedInvoiceId]);

  const activeInvoiceOrder = orders.find((o) => o.id === activeInvoiceOrderId) || null;

  // Handle 2-Factor Order Lookup
  const handleVerifyLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const cleanInvoice = lookupInvoice.trim().toUpperCase();
    const cleanKey = lookupPhoneKey.trim();

    if (!cleanInvoice || !cleanKey) {
      setLookupError('Mohon isi Nomor Nota dan 4 digit terakhir No. WhatsApp.');
      return;
    }

    const target = orders.find((o) => o.id.toUpperCase() === cleanInvoice);

    if (!target) {
      setLookupError(`Nomor Nota "${cleanInvoice}" tidak ditemukan dalam database.`);
      return;
    }

    const waClean = target.whatsapp.replace(/\D/g, '');
    const keyClean = cleanKey.replace(/\D/g, '');
    const isMatch = waClean === keyClean || waClean.endsWith(keyClean);

    if (!isMatch) {
      setLookupError('Verifikasi Gagal: 4 digit No. WA tidak cocok dengan data pemesan nota ini. Demi keamanan, data terlindungi.');
      return;
    }

    setVerifiedInvoiceId(target.id);
    setSelectedOrderId(target.id);

    if (!myOrderIds.includes(target.id)) {
      const updated = [target.id, ...myOrderIds];
      setMyOrderIds(updated);
      try {
        localStorage.setItem('cetakinstan_my_order_ids', JSON.stringify(updated));
      } catch (err) { /* ignore */ }
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (role === 'moderator') return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 8) return '****-****';
    const prefix = cleaned.slice(0, 4);
    const suffix = cleaned.slice(-4);
    return `${prefix}-****-${suffix}`;
  };

  const getStatusIndex = (st: OrderStatus) => {
    return STATUS_STEPS.findIndex((s) => s.key === st);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 space-y-6" id="order-tracker-view">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          <span>Sistem Proteksi Privasi Pelanggan Active</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
          Lacak Status Pesanan Cetakan
        </h2>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Cek progres pengerjaan spanduk, stiker, dan cetakan Anda secara aman dengan verifikasi nomor nota.
        </p>
      </div>

      {/* Safety & Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-amber-400">Jaminan Privasi & Keamanan Data</h4>
            <p className="text-[11px] text-slate-300 leading-snug">
              {role === 'moderator' 
                ? 'Mode Admin (Penjual) Aktif: Kelola daftar transaksi toko, filter waktu & status pesanan tertahan.'
                : 'Daftar pesanan publik disembunyikan. Hanya Anda yang memegang No. Nota dan No. WA yang dapat melihat progres cetakan.'}
            </p>
          </div>
        </div>

        {role === 'buyer' ? (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30 flex items-center space-x-1">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Mode Pembeli (Aman)</span>
          </span>
        ) : (
          <div className="flex items-center space-x-2 shrink-0">
            {stuckOrdersCount > 0 && (
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center space-x-1 animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>{stuckOrdersCount} Tertahan</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* BUYER MODE: SECURE PRIVATE SEARCH & MY ORDERS TABS */}
      {/* ========================================================= */}
      {role === 'buyer' ? (
        <div className="space-y-6">
          
          {/* Sub-tab Navigation */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 max-w-md mx-auto">
            <button
              onClick={() => setBuyerSubTab('my_orders')}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-lg py-2 text-xs font-bold transition ${
                buyerSubTab === 'my_orders'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Pesanan Perangkat Ini ({myDeviceOrdersList.length})</span>
            </button>
            <button
              onClick={() => setBuyerSubTab('lookup')}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-lg py-2 text-xs font-bold transition ${
                buyerSubTab === 'lookup'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KeyRound className="h-4 w-4 text-amber-500" />
              <span>Verifikasi No. Nota</span>
            </button>
          </div>

          {/* SUB-TAB 1: MY DEVICE ORDERS */}
          {buyerSubTab === 'my_orders' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: List of My Device Orders */}
              <div className="space-y-3 lg:col-span-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daftar Pesanan di Perangkat Ini
                </h3>

                {myDeviceOrdersList.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3">
                    <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Belum Ada Pesanan di Perangkat Ini</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      Pesanan yang Anda buat di browser ini akan tersimpan otomatis di sini. Jika Anda memiliki No. Nota dari perangkat lain, gunakan tab Verifikasi No. Nota.
                    </p>
                    <button
                      onClick={() => setBuyerSubTab('lookup')}
                      className="inline-flex items-center space-x-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs py-2 px-3 hover:bg-amber-400 transition"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Verifikasi Nota Baru</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {myDeviceOrdersList.map((ord) => {
                      const isSelected = selectedOrder?.id === ord.id;
                      const statusObj = STATUS_STEPS.find((s) => s.key === ord.status);
                      return (
                        <button
                          key={ord.id}
                          onClick={() => setSelectedOrderId(ord.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 space-y-1.5 ${
                            isSelected
                              ? 'border-[#FFCC00] bg-[#FFCC00]/10 dark:border-[#FFCC00]/50 dark:bg-[#FFCC00]/5 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#121316] dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{ord.id}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-[#FFCC00]">
                              {statusObj?.label}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                            {ord.customerName} ({ord.items.length} item)
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{getRelativeTimeString(ord.createdAt)}</span>
                            </span>
                            <span className="font-extrabold text-amber-600 dark:text-[#FFCC00]">{formatIDR(ord.totalAmount)}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Active Order Stepper Details */}
              <div className="lg:col-span-2">
                {selectedOrder ? (
                  <OrderDetailsCard
                    order={selectedOrder}
                    role={role}
                    onOpenInvoice={() => setActiveInvoiceOrderId(selectedOrder.id)}
                    maskPhoneNumber={maskPhoneNumber}
                    getStatusIndex={getStatusIndex}
                  />
                ) : (
                  <div className="p-10 text-center rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 space-y-2">
                    <Search className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Pesanan untuk Melihat Progres</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SUB-TAB 2: 2-FACTOR LOOKUP FORM */}
          {buyerSubTab === 'lookup' && (
            <div className="max-w-xl mx-auto space-y-6">
              <form onSubmit={handleVerifyLookup} className="p-6 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <KeyRound className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Verifikasi Keamanan Nota Pesanan</h3>
                    <p className="text-[11px] text-slate-500">Masukkan Nomor Nota & 4 digit terakhir WhatsApp untuk membukanya.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      1. Nomor Nota Invoice (Contoh: INV-20260819-001)
                    </label>
                    <input
                      type="text"
                      value={lookupInvoice}
                      onChange={(e) => setLookupInvoice(e.target.value)}
                      placeholder="e.g. INV-20260819-001"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-bold text-slate-900 dark:text-white uppercase focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                      2. 4 Digit Terakhir No. WhatsApp Pemesan
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      value={lookupPhoneKey}
                      onChange={(e) => setLookupPhoneKey(e.target.value)}
                      placeholder="e.g. 9687"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-xs font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Verifikasi ini memastikan hanya pemesan sah yang dapat melihat rincian nota & desain cetakan.</p>
                  </div>
                </div>

                {lookupError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-bold text-red-600 dark:text-red-400 flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{lookupError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 transition shadow-md flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verifikasi & Buka Status Pesanan</span>
                </button>
              </form>

              {/* Verified Result Area */}
              {verifiedOrder && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verifikasi Berhasil! Pesanan #{verifiedOrder.id} telah dibuka dan disimpan di perangkat ini.</span>
                  </div>

                  <OrderDetailsCard
                    order={verifiedOrder}
                    role={role}
                    onOpenInvoice={() => setActiveInvoiceOrderId(verifiedOrder.id)}
                    maskPhoneNumber={maskPhoneNumber}
                    getStatusIndex={getStatusIndex}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      ) : (
        /* ========================================================= */
        /* MODERATOR (ADMIN) MODE: MASTER DIRECTORY, TIME & STATUS FILTERS */
        /* ========================================================= */
        <div className="space-y-6">
          
          {/* Admin Master Header & Quick Filter Banner */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Panel Pengelolaan Pesanan Toko (Master Admin List)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Total Pesanan: <strong>{orders.length} Transaksi</strong> &bull; Tampil: <strong>{adminFilteredOrders.length} Pesanan</strong>
                  </p>
                </div>
              </div>

              {/* Admin Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  placeholder="Cari No. Nota / Nama / WA..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs font-semibold text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter controls row: Time Filter + Sort Order + Stuck Shortcut */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              
              {/* Filter Rentang Waktu (Menit, Jam, Hari, Bulan) */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1 text-amber-400" />
                  Waktu:
                </span>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setTimeRangeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      timeRangeFilter === 'all'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setTimeRangeFilter('1h')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      timeRangeFilter === '1h'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    1 Jam Terakhir
                  </button>
                  <button
                    onClick={() => setTimeRangeFilter('today')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      timeRangeFilter === 'today'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => setTimeRangeFilter('month')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      timeRangeFilter === 'month'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bulan Ini
                  </button>
                </div>
              </div>

              {/* Sort Order (Terbaru / Terlama) */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-amber-400" />
                  Urutkan:
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="bg-slate-950 border border-slate-800 text-white text-[11px] font-bold rounded-xl px-3 py-1.5 focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="newest">⏱️ Terbaru First (Urut Menit)</option>
                  <option value="oldest">⌛ Terlama First</option>
                </select>
              </div>

            </div>

            {/* Quick Status Pill Bar (Filter Pesanan Tertahan & Fase Pengiriman) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Filter Status:
              </span>

              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 border-white'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Semua Status ({orders.length})
              </button>

              <button
                onClick={() => setStatusFilter('stuck')}
                className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border flex items-center space-x-1 transition ${
                  statusFilter === 'stuck'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>⚠️ Belum Selesai / Tertahan ({stuckOrdersCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter('ready_delivery')}
                className={`px-3 py-1 rounded-lg text-[11px] font-extrabold border flex items-center space-x-1 transition ${
                  statusFilter === 'ready_delivery'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                }`}
              >
                <span>🚚 Tertahan Di Fase Kirim / Ambil ({deliveryStuckCount})</span>
              </button>

              {STATUS_STEPS.map((st) => {
                const count = orders.filter((o) => o.status === st.key).length;
                if (count === 0 && statusFilter !== st.key) return null;
                return (
                  <button
                    key={st.key}
                    onClick={() => setStatusFilter(st.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                      statusFilter === st.key
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st.label} ({count})
                  </button>
                );
              })}
            </div>

          </div>

          {/* Master Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Full Master List for Admin */}
            <div className="space-y-3 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Daftar Pesanan ({adminFilteredOrders.length})
                </h3>
                {timeRangeFilter !== 'all' && (
                  <span className="text-[10px] font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Filter Waktu Aktif
                  </span>
                )}
              </div>

              {adminFilteredOrders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-2">
                  <AlertCircle className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tidak ada pesanan yang sesuai filter.</p>
                  <p className="text-[11px] text-slate-500">Coba ubah filter rentang waktu atau kata kunci pencarian.</p>
                  <button
                    onClick={() => {
                      setAdminSearchQuery('');
                      setTimeRangeFilter('all');
                      setStatusFilter('all');
                    }}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-1 inline-block"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {adminFilteredOrders.map((ord) => {
                    const isSelected = selectedOrder?.id === ord.id;
                    const statusObj = STATUS_STEPS.find((s) => s.key === ord.status);
                    const isCompleted = ord.status === 'completed';

                    return (
                      <button
                        key={ord.id}
                        onClick={() => setSelectedOrderId(ord.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 space-y-1.5 ${
                          isSelected
                            ? 'border-[#FFCC00] bg-[#FFCC00]/10 dark:border-[#FFCC00]/50 dark:bg-[#FFCC00]/5 shadow-xs ring-1 ring-[#FFCC00]'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#121316] dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{ord.id}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-[#FFCC00]/20 text-amber-700 dark:text-[#FFCC00]'
                          }`}>
                            {statusObj?.label}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {ord.customerName} ({ord.whatsapp})
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                          <span className="flex items-center space-x-1 text-[10px] font-semibold text-slate-400">
                            <Clock className="h-3 w-3 text-[#FFCC00]" />
                            <span>{getRelativeTimeString(ord.createdAt)}</span>
                          </span>
                          <span className="font-extrabold text-amber-600 dark:text-[#FFCC00]">{formatIDR(ord.totalAmount)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Order Stepper & Admin Status Controls */}
            <div className="lg:col-span-2">
              {selectedOrder ? (
                <div className="space-y-4">
                  {/* Status Change Controls for Moderator */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Shield className="h-4 w-4" />
                        <span>Update Status Pengerjaan Nota #{selectedOrder.id}</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Waktu Masuk: {getRelativeTimeString(selectedOrder.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {STATUS_STEPS.map((st) => {
                        const isActive = selectedOrder.status === st.key;
                        return (
                          <button
                            key={st.key}
                            onClick={() => onUpdateOrderStatus(selectedOrder.id, st.key)}
                            className={`text-xs font-bold px-3 py-2 rounded-xl border transition flex items-center space-x-1.5 ${
                              isActive
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-extrabold'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {isActive && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                            <span>{st.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <OrderDetailsCard
                    order={selectedOrder}
                    role={role}
                    onOpenInvoice={() => setActiveInvoiceOrderId(selectedOrder.id)}
                    maskPhoneNumber={maskPhoneNumber}
                    getStatusIndex={getStatusIndex}
                  />
                </div>
              ) : (
                <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Pilih salah satu pesanan untuk melihat dan mengubah status.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Invoice Modal Overlay */}
      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          onClose={() => setActiveInvoiceOrderId(null)}
          hideSensitiveData={role === 'buyer'}
        />
      )}
    </div>
  );
}

// Sub-component for rendering Order Details & Stepper Timeline
function OrderDetailsCard({
  order,
  role,
  onOpenInvoice,
  maskPhoneNumber,
  getStatusIndex
}: {
  order: OrderRecord;
  role: 'buyer' | 'moderator';
  onOpenInvoice: () => void;
  maskPhoneNumber: (phone: string) => string;
  getStatusIndex: (st: OrderStatus) => number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:bg-[#121316] dark:border-white/10 p-6 space-y-6 shadow-xs">
      
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{order.id}</h3>
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-[#FFCC00]/20 text-amber-700 dark:text-[#FFCC00]">
              {STATUS_STEPS.find((s) => s.key === order.status)?.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pemesan: <strong className="text-slate-800 dark:text-slate-200">{order.customerName}</strong> ({maskPhoneNumber(order.whatsapp)})
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dibuat: {getRelativeTimeString(order.createdAt)} ({new Date(order.createdAt).toLocaleString('id-ID')})
          </p>
        </div>

        <button
          onClick={onOpenInvoice}
          className="flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 px-3.5 py-2 text-xs font-bold transition shadow-xs"
        >
          <FileText className="h-4 w-4 text-[#FFCC00] dark:text-amber-600" />
          <span>Cetak / Lihat Nota</span>
        </button>
      </div>

      {/* Interactive Stepper Vertical Timeline */}
      <div className="space-y-4 pt-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Progres Pengerjaan Cetakan:
        </h4>

        <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
          {STATUS_STEPS.map((step, idx) => {
            const currentIdx = getStatusIndex(order.status);
            const isDone = idx <= currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div key={step.key} className="relative pl-6 space-y-1">
                {/* Circle Bullet Marker */}
                <div
                  className={`absolute -left-[25px] top-0.5 h-6 w-6 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#FFCC00] text-slate-950 ring-4 ring-[#FFCC00]/30 scale-110'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-600'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>

                <div className="flex items-center space-x-2">
                  <h5 className={`text-sm font-extrabold ${
                    isCurrent
                      ? 'text-amber-600 dark:text-[#FFCC00]'
                      : isDone
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {step.label}
                  </h5>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFCC00]/20 text-amber-700 dark:text-[#FFCC00] animate-pulse">
                      Sedang Berlangsung
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordered Items Summary */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Item yang Dipesan ({order.items.length}):
        </h4>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {order.items.map((it) => (
            <div key={it.id} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white">{it.productName}</p>
                <p className="text-[11px] text-slate-500">
                  {it.material.name} &bull; Qty: {it.quantity} {it.unit}
                </p>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">{formatIDR(it.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
