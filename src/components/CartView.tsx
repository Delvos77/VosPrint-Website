/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, User, Phone, Truck, MapPin, X, Send, AlertCircle } from 'lucide-react';
import { CartItem, OrderInfo, OrderRecord } from '../types';
import { formatIDR, WHATSAPP_NUMBER_DEFAULT } from '../data';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQty: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onSaveOrderRecord?: (newOrder: OrderRecord) => void;
  isDrawer?: boolean; // Jika true, render sebagai side-drawer, jika false render sebagai full page
  onCloseDrawer?: () => void; // Hanya berlaku jika isDrawer = true
}

export default function CartView({
  cart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onSaveOrderRecord,
  isDrawer = false,
  onCloseDrawer
}: CartViewProps) {
  // 1. Orderer Info Form States
  const [orderInfo, setOrderInfo] = useState<OrderInfo>(() => {
    const saved = localStorage.getItem('cetakinstan_order_info');
    return saved ? JSON.parse(saved) : {
      name: '',
      whatsapp: '',
      deliveryMethod: 'pickup',
      address: ''
    };
  });

  const [formError, setFormError] = useState<string>('');
  const [itemPendingDelete, setItemPendingDelete] = useState<string | null>(null);
  const [showClearCartConfirm, setShowClearCartConfirm] = useState<boolean>(false);

  // Simpan info pemesan ke local storage agar user tidak capek ketik ulang
  useEffect(() => {
    localStorage.setItem('cetakinstan_order_info', JSON.stringify(orderInfo));
  }, [orderInfo]);

  // Hitung total belanjaan
  const totalCartPrice = cart.reduce((acc, item) => acc + item.subtotal, 0);

  // Send order to WhatsApp
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setFormError('Keranjang Anda masih kosong. Silakan pilih layanan terlebih dahulu.');
      return;
    }

    if (!orderInfo.name.trim()) {
      setFormError('Nama pemesan harus diisi.');
      return;
    }

    if (!orderInfo.whatsapp.trim()) {
      setFormError('Nomor WhatsApp harus diisi.');
      return;
    }

    if (orderInfo.deliveryMethod === 'delivery' && !orderInfo.address.trim()) {
      setFormError('Alamat pengiriman lengkap harus diisi untuk opsi Pengiriman Kurir.');
      return;
    }

    setFormError('');

    // Rangkai Pesan WhatsApp yang Rapi & Indah
    let message = `*NOTA PEMESANAN - CETAKINSTAN*\n`;
    message += `=============================\n\n`;
    message += `👤 *DATA PEMESAN:*\n`;
    message += `• *Nama:* ${orderInfo.name}\n`;
    message += `• *No. WA:* ${orderInfo.whatsapp}\n`;
    message += `• *Pengambilan:* ${orderInfo.deliveryMethod === 'pickup' ? 'Ambil di Toko' : 'Kirim via Kurir/Ekspedisi'}\n`;
    if (orderInfo.deliveryMethod === 'delivery') {
      message += `• *Alamat:* ${orderInfo.address}\n`;
    }
    message += `\n`;
    message += `🛒 *RINCIAN CETAKAN:*\n`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.productName}*\n`;
      message += `   - *Bahan:* ${item.material.name}\n`;
      if (item.width && item.length) {
        message += `   - *Ukuran:* ${item.width} x ${item.length} meter\n`;
      }
      if (item.pages) {
        message += `   - *Jumlah Halaman:* ${item.pages} hlm\n`;
      }
      if (item.finishing.length > 0) {
        const finishingsList = item.finishing.map(f => f.name).join(', ');
        message += `   - *Finishing:* ${finishingsList}\n`;
      }
      message += `   - *Jumlah:* ${item.quantity} ${item.unit}\n`;
      message += `   - *Link Desain:* ${item.designUrl ? item.designUrl : '_(Belum ada link, akan dikirim manual)_'}\n`;
      if (item.notes.trim()) {
        message += `   - *Catatan:* "${item.notes}"\n`;
      }
      message += `   - *Subtotal:* ${formatIDR(item.subtotal)}\n\n`;
    });

    // Create Order Record for tracking and invoicing
    const newOrder: OrderRecord = {
      id: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      customerName: orderInfo.name,
      whatsapp: orderInfo.whatsapp,
      deliveryMethod: orderInfo.deliveryMethod,
      address: orderInfo.address,
      items: [...cart],
      totalAmount: totalCartPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (onSaveOrderRecord) {
      onSaveOrderRecord(newOrder);
    }

    try {
      const existingMyOrders = JSON.parse(localStorage.getItem('cetakinstan_my_order_ids') || '[]');
      if (!existingMyOrders.includes(newOrder.id)) {
        localStorage.setItem('cetakinstan_my_order_ids', JSON.stringify([newOrder.id, ...existingMyOrders]));
      }
    } catch (e) {
      // Ignore storage error
    }

    message += `=============================\n`;
    message += `📑 *NO. NOTA PESANAN: ${newOrder.id}*\n`;
    message += `💰 *TOTAL BIAYA: ${formatIDR(totalCartPrice)}*\n`;
    message += `=============================\n\n`;
    message += `_Mohon diproses pesanannya ya Admin vosprint, file desain siap cetak sudah dilampirkan atau akan dikoordinasikan. Terima kasih!_`;

    // Encode URL
    const targetPhone = WHATSAPP_NUMBER_DEFAULT; 
    const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;

    // Buka WhatsApp di tab baru
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    
    // Opsional: Clear keranjang setelah order dikirim (agar tidak double checkout)
    // onClearCart();
  };

  // Content render helper (Cart list & Form)
  const renderCartContent = () => {
    if (cart.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center" id="empty-cart-state">
          <div className="rounded-full bg-slate-100 p-4 text-slate-400 mb-4" id="empty-cart-icon">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Keranjang Belanja Kosong</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
            Pilih layanan cetak berkualitas kami dari katalog untuk ditambahkan ke keranjang.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6" id="cart-items-wrapper">
        
        {/* Cart list items */}
        <div className="space-y-3" id="cart-items-list">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Cetakan</span>
            <button
              type="button"
              id="clear-cart-btn"
              onClick={() => setShowClearCartConfirm(true)}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:underline transition cursor-pointer"
            >
              Hapus Semua
            </button>
          </div>

          {cart.map((item) => (
            <div 
              key={item.id} 
              id={`cart-item-${item.id}`}
              className="flex flex-col bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 p-3.5 space-y-3 shadow-2xs text-slate-800 dark:text-slate-100"
            >
              {/* Item Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{item.productName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Bahan: <span className="text-slate-600 dark:text-slate-300 font-semibold">{item.material.name}</span></p>
                </div>
                <button
                  type="button"
                  id={`remove-cart-item-${item.id}`}
                  onClick={() => setItemPendingDelete(item.id)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-rose-500 transition"
                  aria-label="Hapus Item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Specs Badge details */}
              <div className="flex flex-wrap gap-1 text-[9px] text-slate-550 dark:text-slate-400" id={`cart-item-specs-${item.id}`}>
                {item.width && item.length && (
                  <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 font-medium">
                    Ukuran: {item.width}x{item.length}m
                  </span>
                )}
                {item.pages && (
                  <span className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 font-bold">
                    Jumlah Halaman: {item.pages} hlm
                  </span>
                )}
                {item.finishing.map((f) => (
                  <span key={f.id} className="bg-amber-50/10 dark:bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 rounded px-1.5 py-0.5 font-medium">
                    {f.name}
                  </span>
                ))}
                {item.designUrl && (
                  <span className="bg-cyan-50/10 dark:bg-cyan-500/10 border border-cyan-500/25 text-cyan-800 dark:text-cyan-450 rounded px-1.5 py-0.5 font-semibold truncate max-w-[150px]">
                    File: Terlampir
                  </span>
                )}
              </div>

              {/* Note / Catatan */}
              {item.notes.trim() && (
                <div className="rounded bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 italic border-l-2 border-slate-300 dark:border-slate-700" id={`cart-item-note-${item.id}`}>
                  "{item.notes}"
                </div>
              )}

              {/* Qty edit & Subtotal */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                {/* Stepper qty */}
                <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-900" id={`qty-stepper-${item.id}`}>
                  <button
                    type="button"
                    id={`qty-dec-${item.id}`}
                    onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-slate-100" id={`qty-val-${item.id}`}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    id={`qty-inc-${item.id}`}
                    onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="block text-[9px] text-slate-400 font-medium">Subtotal</span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100" id={`subtotal-val-${item.id}`}>{formatIDR(item.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Checkout & Data Pemesan */}
        <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 space-y-4" id="checkout-form-section">
          <div className="flex items-center space-x-1.5 border-b border-slate-200 pb-2">
            <User className="h-4 w-4 text-slate-500" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">Form Data Pemesan</h5>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Pemesan</label>
              <input
                type="text"
                required
                placeholder="Masukkan nama lengkap"
                id="order-form-name"
                value={orderInfo.name}
                onChange={(e) => setOrderInfo({ ...orderInfo, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-hidden placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor WhatsApp (Aktif)</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">+62</span>
                <input
                  type="tel"
                  required
                  placeholder="81234567890"
                  id="order-form-phone"
                  value={orderInfo.whatsapp}
                  onChange={(e) => {
                    // Hanya izinkan angka saja
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setOrderInfo({ ...orderInfo, whatsapp: val });
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-12 pr-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-hidden placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Metode Pengambilan</label>
              <div className="grid grid-cols-2 gap-2" id="delivery-method-grid">
                <button
                  type="button"
                  id="delivery-method-pickup"
                  onClick={() => setOrderInfo({ ...orderInfo, deliveryMethod: 'pickup' })}
                  className={`flex items-center justify-center space-x-1.5 rounded-lg border py-2 px-3 text-xs font-bold transition ${
                    orderInfo.deliveryMethod === 'pickup'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Ambil Toko</span>
                </button>
                <button
                  type="button"
                  id="delivery-method-delivery"
                  onClick={() => setOrderInfo({ ...orderInfo, deliveryMethod: 'delivery' })}
                  className={`flex items-center justify-center space-x-1.5 rounded-lg border py-2 px-3 text-xs font-bold transition ${
                    orderInfo.deliveryMethod === 'delivery'
                      ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="h-3.5 w-3.5" />
                  <span>Kirim Kurir</span>
                </button>
              </div>
            </div>

            {orderInfo.deliveryMethod === 'delivery' && (
              <div className="animate-fade-in">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  Alamat Pengiriman Lengkap
                </label>
                <textarea
                  required
                  placeholder="Ketik alamat jalan, RT/RW, Kecamatan, Kota, Kode Pos"
                  id="order-form-address"
                  value={orderInfo.address}
                  onChange={(e) => setOrderInfo({ ...orderInfo, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs text-slate-800 focus:border-amber-500 focus:outline-hidden placeholder:text-slate-400 resize-none"
                />
              </div>
            )}
          </div>

          {/* Biaya checkout & action */}
          <div className="border-t border-slate-200 pt-3 mt-4 space-y-3" id="checkout-pricing">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-600">Total Tagihan Cetak:</span>
              <span className="text-base text-orange-600 font-extrabold" id="cart-total-price-display">{formatIDR(totalCartPrice)}</span>
            </div>
            
            <p className="text-[9px] text-slate-400 leading-normal">
              *Pesanan Anda akan dikirim ke WhatsApp admin dalam format draf yang terstruktur untuk divalidasi dan dihitung ongkos kirimnya jika ada.
            </p>

            {formError && (
              <div className="flex items-start space-x-1.5 rounded bg-rose-50 border border-rose-100 p-2 text-rose-600 text-[10px]" id="cart-form-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              id="send-whatsapp-checkout-btn"
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition duration-200 active:scale-98"
            >
              <Send className="h-4 w-4" />
              <span>Kirim Pesanan ke WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmModal = () => {
    if (!itemPendingDelete) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in" id="delete-confirm-overlay">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-100 animate-slide-up">
          <div className="flex items-center space-x-3 text-red-500">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <h3 className="text-base font-bold">Hapus Item Cetakan?</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menghapus layanan cetak ini dari keranjang? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              id="cancel-delete-btn"
              onClick={() => setItemPendingDelete(null)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold hover:bg-slate-55 dark:hover:bg-slate-900 transition"
            >
              Batal
            </button>
            <button
              type="button"
              id="confirm-delete-btn"
              onClick={() => {
                if (itemPendingDelete) {
                  onRemoveItem(itemPendingDelete);
                  setItemPendingDelete(null);
                }
              }}
              className="rounded-lg bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderClearCartConfirmModal = () => {
    if (!showClearCartConfirm) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in" id="clear-cart-confirm-overlay">
        <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 border border-slate-200 dark:border-slate-750 text-slate-800 dark:text-slate-100 animate-slide-up">
          <div className="flex items-center space-x-3 text-red-500">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <h3 className="text-base font-bold">Kosongkan Keranjang?</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Apakah Anda yakin ingin menghapus semua item dari keranjang belanja Anda? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              id="cancel-clear-cart-btn"
              onClick={() => setShowClearCartConfirm(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold hover:bg-slate-55 dark:hover:bg-slate-900 transition"
            >
              Batal
            </button>
            <button
              type="button"
              id="confirm-clear-cart-btn"
              onClick={() => {
                onClearCart();
                setShowClearCartConfirm(false);
              }}
              className="rounded-lg bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 text-xs font-bold shadow-sm transition"
            >
              Ya, Kosongkan
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 3. Render layout based on Drawer vs Tab Dashboard
  if (isDrawer) {
    return (
      <>
        <div id="cart-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          {/* Backdrop click to close */}
          <div className="absolute inset-0 -z-10" onClick={onCloseDrawer}></div>

          {/* Drawer container */}
          <div 
            id="cart-drawer-body"
            className="w-full max-w-md h-full bg-slate-50 dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-left overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-white" id="drawer-header">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-amber-400" />
                <h2 className="text-base font-bold">Keranjang Belanja</h2>
                <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                  {cart.length}
                </span>
              </div>
              <button 
                id="close-cart-drawer"
                onClick={onCloseDrawer} 
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5" id="drawer-main-content">
              {renderCartContent()}
            </div>
          </div>
        </div>
        {renderDeleteConfirmModal()}
        {renderClearCartConfirmModal()}
      </>
    );
  }

  // Else, Render as full screen view (Tablet/Mobile Page layout)
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6" id="cart-page-view">
        <div className="mb-6 flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <ShoppingBag className="h-6 w-6 text-slate-800 dark:text-slate-100" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Keranjang Belanja Anda</h2>
            <p className="text-xs text-slate-500">Rincian spesifikasi cetakan dan data pemesan</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs md:p-6" id="cart-page-inner">
          {renderCartContent()}
        </div>
      </div>
      {renderDeleteConfirmModal()}
      {renderClearCartConfirmModal()}
    </>
  );
}
