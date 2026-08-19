/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Link, FileText, Check, Calculator, AlertCircle, Maximize2, Upload, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, MaterialOption, FinishingOption, CartItem, FileQualityRating } from '../types';
import { calculatePrintPrice, formatIDR, getWholesaleDiscountPercent } from '../data';

interface CalculatorModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  initialTemplateName?: string;
  initialTemplateUrl?: string;
}

export default function CalculatorModal({ 
  product, 
  onClose, 
  onAddToCart,
  initialTemplateName,
  initialTemplateUrl
}: CalculatorModalProps) {
  // 1. States Form
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(product.materials[0]);
  const [width, setWidth] = useState<number>(1.0); // meter
  const [length, setLength] = useState<number>(1.0); // meter
  const [pages, setPages] = useState<number>(() => {
    if (product.gridPrices && product.gridPrices.rows.length > 0) {
      return product.gridPrices.rows[0].pages;
    }
    return 80;
  });
  const [selectedFinishings, setSelectedFinishings] = useState<FinishingOption[]>([]);
  const [quantity, setQuantity] = useState<number>(product.minQty);
  const [designUrl, setDesignUrl] = useState<string>(initialTemplateUrl || '');
  const [uploadedFileName, setUploadedFileName] = useState<string>(initialTemplateName ? `Templat: ${initialTemplateName}` : '');
  const [fileQuality, setFileQuality] = useState<FileQualityRating | undefined>(initialTemplateName ? 'high' : undefined);
  const [fileSizeMb, setFileSizeMb] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10MB.');
      return;
    }

    const sizeInMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
    setFileSizeMb(sizeInMb);
    setUploadedFileName(file.name);

    // Evaluate Quality
    let rating: FileQualityRating = 'medium';
    if (sizeInMb >= 1.5) {
      rating = 'high';
    } else if (sizeInMb < 0.4) {
      rating = 'low';
    }
    setFileQuality(rating);

    const reader = new FileReader();
    reader.onloadend = () => {
      setDesignUrl(reader.result as string);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // 2. Auto-reset form jika produk berubah
  useEffect(() => {
    setSelectedMaterial(product.materials[0]);
    setWidth(1.0);
    setLength(1.0);
    setPages(product.gridPrices && product.gridPrices.rows.length > 0 ? product.gridPrices.rows[0].pages : 80);
    setSelectedFinishings([]);
    setQuantity(product.minQty);
    setDesignUrl('');
    setNotes('');
    setError('');
  }, [product]);

  // 3. Hitung harga real-time
  const priceDetails = calculatePrintPrice({
    product,
    material: selectedMaterial,
    width,
    length,
    pages,
    finishing: selectedFinishings,
    quantity
  });

  // Handler toggle finishing
  const handleToggleFinishing = (finishing: FinishingOption) => {
    if (selectedFinishings.some((f) => f.id === finishing.id)) {
      setSelectedFinishings(selectedFinishings.filter((f) => f.id !== finishing.id));
    } else {
      setSelectedFinishings([...selectedFinishings, finishing]);
    }
  };

  // Preset Ukuran Spanduk Populer
  const applySizePreset = (w: number, l: number) => {
    setWidth(w);
    setLength(l);
  };

  // Submit Ke Keranjang
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < product.minQty) {
      setError(`Kuantitas minimal untuk produk ini adalah ${product.minQty} ${product.unit}.`);
      return;
    }

    if (designUrl && !designUrl.startsWith('http://') && !designUrl.startsWith('https://') && !designUrl.startsWith('data:')) {
      setError('Tolong masukkan URL link file desain yang valid (misal: https://drive.google.com/...) atau unggah file.');
      return;
    }

    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      pricingType: product.pricingType,
      unit: product.unit,
      material: selectedMaterial,
      width: product.pricingType === 'area' ? width : undefined,
      length: product.pricingType === 'area' ? length : undefined,
      pages: product.pricingType === 'grid' ? pages : undefined,
      finishing: selectedFinishings,
      quantity,
      designUrl,
      uploadedFileName: uploadedFileName || undefined,
      fileQuality: fileQuality,
      fileSizeMb: fileSizeMb,
      notes,
      subtotal: priceDetails.total,
      originalSubtotal: priceDetails.originalTotal,
      wholesaleDiscountPercent: priceDetails.wholesaleDiscountPercent
    };

    onAddToCart(newItem);
    onClose();
  };

  return (
    <motion.div 
      id="calculator-modal-container" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 md:items-center md:p-4"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Main Container */}
      <motion.div 
        id="calc-dialog-body"
        initial={{ y: 35, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-h-[90vh] md:max-h-[85vh] md:max-w-4xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
      >
        {/* Header Modal */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white" id="modal-header">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-md bg-amber-500/20 p-1.5 text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight md:text-lg">Kalkulator Custom Cetak</h2>
              <p className="text-[11px] text-slate-300 font-medium">{product.name}</p>
            </div>
          </div>
          <button 
            id="close-calculator-modal"
            onClick={onClose} 
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form & Pricing split layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6" id="calculator-form">
          
          {/* SISI KIRI: INPUT FORM CETAK (8 cols di desktop) */}
          <div className="space-y-5 md:col-span-7" id="calc-inputs-left">
            
            {/* 1. Pilih Bahan */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs" id="material-selector-section">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                1. Pilihan Bahan Material
              </label>
              <div className="grid grid-cols-1 gap-2" id="material-options-list">
                {product.materials.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    id={`material-opt-${m.id}`}
                    onClick={() => setSelectedMaterial(m)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition ${
                      selectedMaterial.id === m.id
                        ? 'border-amber-500 bg-amber-50/10 dark:bg-amber-500/10 ring-1 ring-amber-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.name}</p>
                      <p className="text-[10px] text-slate-400">Standard cetak berkualitas tinggi</p>
                    </div>
                    <div className="text-right">
                      {m.extraPrice === 0 ? (
                        <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">Standard</span>
                      ) : m.extraPrice > 0 ? (
                        <span className="text-[11px] font-bold text-orange-600">+{formatIDR(m.extraPrice)}</span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600">{formatIDR(m.extraPrice)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Ukuran Custom (Hanya untuk Banner/Meteran) */}
            {product.pricingType === 'area' && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs" id="custom-size-section">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  2. Tentukan Ukuran (Meter)
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Panjang (Lebar Horizontal)</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        id="input-banner-width"
                        value={width}
                        onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 pl-3 pr-10 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-hidden"
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-400">Meter</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Lebar (Tinggi Vertikal)</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        id="input-banner-length"
                        value={length}
                        onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2.5 pl-3 pr-10 text-xs font-bold text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-hidden"
                      />
                      <span className="absolute right-3 text-xs font-bold text-slate-400">Meter</span>
                    </div>
                  </div>
                </div>

                {/* Preset Ukuran */}
                <div className="mt-3.5" id="banner-presets">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Preset Ukuran Populer:</span>
                  <div className="flex flex-wrap gap-1.5" id="size-presets-container">
                    {[
                      { label: '1 x 1 m', w: 1, l: 1 },
                      { label: '2 x 1 m', w: 2, l: 1 },
                      { label: '3 x 1 m', w: 3, l: 1 },
                      { label: '3 x 2 m', w: 3, l: 2 },
                      { label: '4 x 1 m', w: 4, l: 1 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        id={`preset-${preset.w}x${preset.l}`}
                        onClick={() => applySizePreset(preset.w, preset.l)}
                        className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Pilih Jumlah Halaman (Khusus Tipe Grid Cetak Buku) */}
            {product.pricingType === 'grid' && product.gridPrices && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs" id="custom-pages-section">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  2. Pilih Jumlah Halaman Buku
                </label>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" id="pages-options-grid">
                  {product.gridPrices.rows.map((row: any) => (
                    <button
                      key={row.pages}
                      type="button"
                      onClick={() => setPages(row.pages)}
                      className={`rounded-lg border py-2 px-1 text-center transition font-bold text-[11px] ${
                        pages === row.pages
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500 font-extrabold'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-300'
                      }`}
                    >
                      {row.pages} hlm
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 mt-2.5">
                  *Pricelist otomatis disesuaikan berdasarkan baris matriks cetakan yang Anda pilih.
                </p>
              </div>
            )}

            {/* 3. Finishing Checklist */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs" id="finishing-selector-section">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                {product.pricingType === 'area' ? '3' : '2'}. Opsi Finishing / Kelengkapan
              </label>
              
              <div className="grid grid-cols-1 gap-2" id="finishing-options-list">
                {product.finishings.map((f) => {
                  const isChecked = selectedFinishings.some((item) => item.id === f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      id={`finishing-opt-${f.id}`}
                      onClick={() => handleToggleFinishing(f)}
                      className={`flex items-start rounded-lg border p-3 text-left transition ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/10 dark:bg-amber-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex h-5 items-center">
                        <div className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                          isChecked ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.name}</p>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {f.price === 0 ? 'Gratis' : `+${formatIDR(f.price)}${f.isPerUnit ? `/${product.unit === 'm²' && f.id === 'lipat-lem' ? 'm keliling' : product.unit}` : ' (Flat)'}`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{f.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Link Desain, Upload File, & Catatan */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs space-y-3" id="design-link-section">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                {product.pricingType === 'area' ? '4' : '3'}. Upload File Desain / Link & Catatan
              </label>
              
              {/* Direct File Upload Dropzone */}
              <div className="p-3 border border-dashed border-amber-500/40 rounded-xl bg-amber-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center">
                    <Upload className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                    Upload File Langsung dari Perangkat (Max 10MB)
                  </label>
                  <label className="cursor-pointer text-[10px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    Pilih File
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadedFileName && (
                  <div className="p-2 rounded-lg bg-slate-900 text-white text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate max-w-[200px]">{uploadedFileName}</span>
                      {fileSizeMb && <span className="text-[10px] text-slate-400">{fileSizeMb} MB</span>}
                    </div>

                    {fileQuality && (
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span className="text-[10px] font-semibold text-slate-300">Pengecekan Resolusi:</span>
                        {fileQuality === 'high' && (
                          <span className="text-[10px] font-extrabold text-emerald-400 flex items-center">
                            <ShieldCheck className="h-3 w-3 mr-0.5" />
                            🟢 Kualitas Tinggi (Siap Cetak)
                          </span>
                        )}
                        {fileQuality === 'medium' && (
                          <span className="text-[10px] font-extrabold text-amber-400 flex items-center">
                            🟡 Kualitas Sedang
                          </span>
                        )}
                        {fileQuality === 'low' && (
                          <span className="text-[10px] font-extrabold text-rose-400 flex items-center">
                            🔴 File Terlalu Kecil (Potensi Buram)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center">
                  <Link className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  Atau Masukkan Link File (Google Drive / Canva / WeTransfer)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  id="design-file-url"
                  value={designUrl.startsWith('data:') ? '' : designUrl}
                  onChange={(e) => {
                    setDesignUrl(e.target.value);
                    setUploadedFileName('');
                    setFileQuality(undefined);
                  }}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-hidden placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  Catatan Tambahan untuk Operator
                </label>
                <textarea
                  placeholder="Contoh: Cetak landscape, dipotong pas garis batas gambar, tolong dicek kecerahan gambarnya."
                  id="print-notes-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2 px-3 text-xs text-slate-800 dark:text-slate-100 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-hidden placeholder:text-slate-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* SISI KANAN: RINGKASAN HARGA & SUBMIT (5 cols di desktop) */}
          <div className="space-y-4 md:col-span-5 md:sticky md:top-0" id="calc-pricing-right">
            
            {/* Quantity Selector Card */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-xs" id="quantity-control-card">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Jumlah Pesanan
              </label>
              <div className="flex items-center justify-between" id="qty-stepper">
                <div className="flex items-center space-x-1 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <button
                    type="button"
                    id="qty-decrement"
                    onClick={() => setQuantity(Math.max(product.minQty, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition font-bold"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-extrabold text-slate-850 dark:text-slate-100" id="qty-display-calc">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    id="qty-increment"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition font-bold"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {product.unit} {product.pricingType === 'area' ? `(${width * length * quantity} m²)` : ''}
                </span>
              </div>

              {/* Grid Pricing presets shortcuts (Eks) */}
              {product.pricingType === 'grid' && product.gridPrices && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800/60" id="grid-qty-presets">
                  <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Preset Kuantitas Hub:</span>
                  <div className="flex flex-wrap gap-1.5" id="qty-presets-container">
                    {product.gridPrices.tiers.map((t: number) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setQuantity(t)}
                        className={`rounded-md border px-2.5 py-1 text-[10px] font-extrabold transition ${
                          quantity === t
                            ? 'border-amber-500 bg-amber-500 text-slate-950 font-extrabold shadow-3xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t} Eks
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wholesale Quantity Discount Tier Shortcuts */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  🏷️ Diskon Grosir Kuantitas:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(10, quantity))}
                    className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition ${
                      quantity >= 10 && quantity < 50
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-3xs font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    10+ (Diskon 5%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(50, quantity))}
                    className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition ${
                      quantity >= 50 && quantity < 100
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-3xs font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    50+ (Diskon 10%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(100, quantity))}
                    className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg border transition ${
                      quantity >= 100
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-3xs font-extrabold'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    100+ (Diskon 15%)
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 mt-2">
                *Minimal order {product.minQty} {product.unit} untuk layanan ini.
              </p>
            </div>

            {/* Price Live Summary Card */}
            <div className="rounded-xl border border-slate-300 bg-slate-900 text-white p-5 shadow-lg space-y-4" id="live-price-summary-card">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Ringkasan Estimasi Biaya</h4>
              
              <div className="space-y-2 text-xs border-b border-slate-800 pb-3" id="calc-price-breakdown">
                <div className="flex justify-between">
                  <span className="text-slate-400">Harga Satuan Bahan:</span>
                  <span className="font-semibold text-slate-200">{formatIDR(priceDetails.unitPrice)}</span>
                </div>
                {product.pricingType === 'area' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensi Cetak:</span>
                    <span className="font-semibold text-slate-200">{width} m x {length} m ({parseFloat((width * length).toFixed(2))} m²)</span>
                  </div>
                )}
                {product.pricingType === 'grid' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah Halaman:</span>
                    <span className="font-semibold text-slate-200">{pages} halaman (hlm)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah:</span>
                  <span className="font-semibold text-slate-200">{quantity} {product.unit}</span>
                </div>
                {selectedFinishings.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tambahan Finishing:</span>
                    <span className="font-semibold text-slate-200">+{formatIDR(priceDetails.finishingTotal)}</span>
                  </div>
                )}
                {priceDetails.wholesaleDiscountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400 font-extrabold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 mt-1">
                    <span>🎉 Diskon Grosir ({priceDetails.wholesaleDiscountPercent}%):</span>
                    <span>-{formatIDR(priceDetails.discountSavings)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between py-1" id="calc-price-total">
                <span className="text-sm font-bold text-amber-400">Total Biaya:</span>
                <span className="text-xl font-extrabold text-white md:text-2xl" id="modal-price-total">
                  {formatIDR(priceDetails.total)}
                </span>
              </div>

              {/* Error Warning display */}
              {error && (
                <div className="flex items-start space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-rose-300 text-[10px]" id="calc-error-log">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Add to Cart button */}
              <button
                type="submit"
                id="add-to-cart-submit-btn"
                className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-3 px-4 text-sm font-bold text-slate-950 hover:from-amber-400 hover:to-orange-400 focus:outline-hidden transition active:scale-98 shadow-md"
              >
                <span>Masukkan Keranjang</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
