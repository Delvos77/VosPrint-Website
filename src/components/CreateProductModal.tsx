/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Sparkles, AlertCircle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ProductCategory, PricingType } from '../types';

interface CreateProductModalProps {
  onClose: () => void;
  onSave: (newProduct: Product) => void;
}

const GRADIENT_PRESETS = [
  { name: 'Ocean Blue', val: 'from-sky-500 to-indigo-600' },
  { name: 'Warm Orange', val: 'from-amber-500 to-orange-600' },
  { name: 'Fresh Teal', val: 'from-emerald-500 to-teal-600' },
  { name: 'Luxury Purple', val: 'from-purple-500 to-pink-600' },
  { name: 'Sunset Rose', val: 'from-pink-500 to-rose-600' },
  { name: 'Royal Blue', val: 'from-blue-600 to-indigo-700' },
  { name: 'Deep Cyber', val: 'from-fuchsia-600 to-purple-800' },
  { name: 'Metal Gray', val: 'from-slate-700 to-slate-900' }
];

const ICON_PRESETS = [
  { label: '🥞 Layers (Stiker)', name: 'Layers' },
  { label: '📄 FileText (Brosur)', name: 'FileText' },
  { label: '💳 CreditCard (Kartu)', name: 'CreditCard' },
  { label: '📺 Screen (Display)', name: 'Presentation' },
  { label: '🖨️ Printer (General)', name: 'Printer' },
  { label: '📖 BookOpen (Buku)', name: 'BookOpen' },
  { label: '📅 Calendar (Kalender)', name: 'Calendar' },
  { label: '🖼️ Image (Galeri/Foto)', name: 'Image' },
  { label: '❓ HelpCircle (Tanya)', name: 'HelpCircle' }
];

export default function CreateProductModal({ onClose, onSave }: CreateProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exclude<ProductCategory, 'all'>>('banner');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(20000);
  const [unit, setUnit] = useState('m²');
  const [minQty, setMinQty] = useState<number>(1);
  const [pricingType, setPricingType] = useState<PricingType>('area');
  const [imageGradient, setImageGradient] = useState('from-sky-500 to-indigo-600');
  const [iconName, setIconName] = useState('Printer');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file gambar terlalu besar! Silakan gunakan gambar di bawah 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle dynamic presets when pricingType changes for convenience
  const handlePricingTypeChange = (type: PricingType) => {
    setPricingType(type);
    if (type === 'area') {
      setUnit('m²');
      setMinQty(1);
    } else if (type === 'sheet') {
      setUnit('lembar A3+');
      setMinQty(5);
    } else if (type === 'box') {
      setUnit('box (100 lbr)');
      setMinQty(1);
    } else if (type === 'grid') {
      setUnit('buku');
      setMinQty(10);
    } else {
      setUnit('pcs');
      setMinQty(1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama jasa percetakan tidak boleh kosong!');
      return;
    }
    if (!description.trim()) {
      setError('Deskripsi ringkas jasa cetak harus diisi.');
      return;
    }
    if (basePrice <= 0) {
      setError('Harga dasar cetak harus lebih dari Rp 0.');
      return;
    }
    if (minQty < 1) {
      setError('Kuantitas minimal pemesanan harus minimal 1.');
      return;
    }

    // Prepare default initial materials
    let initialMaterials = [
      { id: 'mat-std-1', name: 'Bahan Standard Standard', extraPrice: 0, description: 'Bahan standard ekonomis dengan hasil cetak yang baik dan bersih.', imageUrl: '' },
      { id: 'mat-std-2', name: 'Bahan Premium High-Gloss', extraPrice: 5000, description: 'Bahan premium dengan permukaan berkilau tinggi yang merefleksikan warna secara maksimal.', imageUrl: '' }
    ];

    if (pricingType === 'area') {
      initialMaterials = [
        { id: 'mat-area-1', name: 'Flexi China 280gr (Standard)', extraPrice: 0, description: 'Bahan spanduk standard ekonomis, cocok untuk outdoor jangka menengah.', imageUrl: '' },
        { id: 'mat-area-2', name: 'Flexi Korea 440gr (Tebal Doff)', extraPrice: 15000, description: 'Bahan sangat tebal tanpa kilap, tahan cuaca ekstrem dan tidak mudah robek.', imageUrl: '' }
      ];
    } else if (pricingType === 'sheet') {
      initialMaterials = [
        { id: 'mat-sheet-1', name: 'Stiker Bontax / Chromo', extraPrice: 0, description: 'Bahan dasar kertas mengkilap dengan daya rekat sangat kuat, ideal untuk label makanan.', imageUrl: '' },
        { id: 'mat-sheet-2', name: 'Stiker Vinyl Waterproof', extraPrice: 4000, description: 'Bahan plastik sintetis putih susu lentur tahan air, tidak sobek dan luntur.', imageUrl: '' }
      ];
    }

    // Default initial finishings
    const initialFinishings = [
      { id: 'fin-std-1', name: 'Tanpa Finishing', price: 0, description: 'Potong bersih sesuai ukuran desain asli tanpa lipat atau tambahan lubang.', isPerUnit: false }
    ];

    // Grid pricing template initialization
    let gridPrices;
    if (pricingType === 'grid') {
      gridPrices = {
        tiers: [10, 50, 100, 200, 300],
        rows: [
          { pages: 50, prices: [25000, 22000, 19000, 16000, 14000] },
          { pages: 100, prices: [45000, 39000, 34000, 29000, 25000] },
          { pages: 150, prices: [65000, 58000, 50000, 42000, 36000] }
        ]
      };
    }

    const newProduct: Product = {
      id: `custom-jasa-${Date.now()}`,
      name: name.trim(),
      category,
      description: description.trim(),
      basePrice,
      unit,
      minQty,
      pricingType,
      materials: initialMaterials,
      finishings: initialFinishings,
      imageGradient,
      iconName,
      customImageUrl,
      gridPrices
    };

    onSave(newProduct);
  };

  return (
    <motion.div 
      id="create-product-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      <motion.div 
        id="create-product-dialog"
        initial={{ y: 30, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative w-full max-w-3xl bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-950 px-6 py-4 text-white" id="create-modal-header">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold md:text-lg">Tambah Menu Jasa Baru</h2>
              <p className="text-xs text-slate-400 font-medium">Buat jenis cetakan baru diluar Spanduk, Stiker, atau Brosur standar</p>
            </div>
          </div>
          <button 
            id="close-create-product-modal"
            onClick={onClose} 
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6" id="create-product-form">
          {error && (
            <div className="flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/25 p-3 text-red-500 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Visual Identity */}
          <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-4 shadow-3xs">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>1. Identitas Visual & Kategori</span>
            </h3>

            {/* Live Preview Box */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
              <div 
                className={`w-20 h-20 rounded-xl flex items-center justify-center text-white relative shadow-inner shrink-0 overflow-hidden ${customImageUrl ? '' : `bg-gradient-to-br ${imageGradient}`}`}
                style={customImageUrl ? { backgroundImage: `url(${customImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                {!customImageUrl && (
                  <>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:10px_10px] opacity-20"></div>
                    {iconName === 'Image' && <span className="text-xl">🖼️</span>}
                    {iconName === 'Layers' && <span className="text-xl">🥞</span>}
                    {iconName === 'FileText' && <span className="text-xl">📄</span>}
                    {iconName === 'CreditCard' && <span className="text-xl">💳</span>}
                    {iconName === 'Presentation' && <span className="text-xl">📺</span>}
                    {iconName === 'Printer' && <span className="text-xl">🖨️</span>}
                    {iconName === 'BookOpen' && <span className="text-xl">📖</span>}
                    {iconName === 'Calendar' && <span className="text-xl">📅</span>}
                    {iconName === 'HelpCircle' && <span className="text-xl">❓</span>}
                  </>
                )}
              </div>
              <div className="min-w-0">
                <span className="bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1">{category}</span>
                <h4 className="text-xs font-black text-slate-800 dark:text-white truncate">{name || 'Contoh Nama Cetakan Jasa Baru'}</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                  {description || 'Masukkan deskripsi penawaran jasa untuk menampilkan live preview kartu di sini...'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Jasa Cetak Baru</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Cetak Kalender Dinding 2027"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kategori Filter / Label</label>
                <input
                  type="text"
                  list="new-category-suggestions"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Tulis nama kategori kustom (contoh: Banner, Souvenir, Kalender, dll)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 px-3.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
                <datalist id="new-category-suggestions">
                  <option value="Banner / Spanduk" />
                  <option value="Stiker Label" />
                  <option value="Brosur & Flyer" />
                  <option value="Kartu Nama" />
                  <option value="Display & Stand" />
                  <option value="Cetak Buku & Novel" />
                  <option value="Merchandise & Souvenir" />
                </datalist>
              </div>
            </div>

            {/* Gradient background presets picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Gradient Warna Latar Belakang</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GRADIENT_PRESETS.map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setImageGradient(p.val)}
                    className={`flex items-center space-x-2 rounded-lg border p-1.5 text-left text-xs transition ${
                      imageGradient === p.val
                        ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded bg-gradient-to-br ${p.val} shadow-inner shrink-0`}></div>
                    <span className="text-[10px] font-bold truncate text-slate-700 dark:text-slate-300">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Presets picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Ikon Visual Kartu</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ICON_PRESETS.map((ico) => (
                  <button
                    key={ico.name}
                    type="button"
                    onClick={() => setIconName(ico.name)}
                    className={`rounded-lg border p-1.5 text-center text-xs font-bold transition ${
                      iconName === ico.name
                        ? 'border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-[9px] truncate block">{ico.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image File Upload Block */}
            <div className="space-y-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">🖼️</span>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upload File Gambar Jasa Cetak (Opsional)</label>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                Pilih gambar asli dari komputer Anda (PNG, JPG) untuk menggantikan gradient standard. Gambar akan otomatis tersimpan dalam database browser secara offline sehingga terbaca sempurna di Netlify & GitHub.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <label className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 text-xs font-bold transition cursor-pointer shadow-xs">
                  <span>📁</span>
                  <span>Pilih File Gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {customImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCustomImageUrl('')}
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 px-4 py-2 text-xs font-bold transition hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <span>❌</span>
                    <span>Hapus Gambar</span>
                  </button>
                )}
              </div>

              {customImageUrl && (
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 animate-fade-in">
                  <span>✅</span>
                  <span>File gambar berhasil dimuat!</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Pricing Logic & General Configurations */}
          <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 p-4 shadow-3xs">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              <Info className="h-4 w-4 text-emerald-500" />
              <span>2. Perhitungan Harga & Aturan Jasa</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deskripsi Detail Jasa</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cetak kalender kualitas premium dengan kertas Art Paper tebal berkilau, finishing spiral kawat kokoh..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 px-3.5 text-xs text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipe Skema Perhitungan</label>
                <select
                  value={pricingType}
                  onChange={(e) => handlePricingTypeChange(e.target.value as PricingType)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 px-3.5 text-xs font-bold focus:outline-hidden focus:border-emerald-500 text-slate-850 dark:text-slate-200"
                >
                  <option value="fixed">Satuan Tetap (Pcs)</option>
                  <option value="area">Meteran Luas (Panjang x Lebar) — Cocok untuk Banner</option>
                  <option value="sheet">Lembaran A3+ — Cocok untuk Stiker Label</option>
                  <option value="box">Box / Pack (100 lembar) — Cocok untuk Brosur/Kartu</option>
                  <option value="grid">Tabel Matrix (Pricelist Grid Buku/Halaman)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Harga Dasar Jasa (Rp)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 px-3.5 text-xs font-bold focus:outline-hidden focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Satuan Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="pcs"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 px-3.5 text-xs font-bold focus:outline-hidden focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Min. Kuantitas Pemesanan</label>
                <input
                  type="number"
                  min="1"
                  value={minQty}
                  onChange={(e) => setMinQty(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 px-3.5 text-xs font-bold focus:outline-hidden focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
              
              <div className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 pt-5 space-x-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Setelah dibuat, Anda dapat mengatur harga bahan & finishing secara instan di Admin Panel.</span>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-6 py-4 flex items-center justify-end space-x-3" id="create-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2 px-4 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            id="save-new-jasa-button"
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-5 shadow-md transition"
          >
            <Plus className="h-4 w-4" />
            <span>Buat & Publikasikan Jasa</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
