/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Save, RotateCcw, ShieldAlert, AlertCircle, Trash2, PlusCircle, Check, FileSpreadsheet, Layers, Settings } from 'lucide-react';
import { Product, MaterialOption, FinishingOption } from '../types';
import { formatIDR } from '../data';

interface AdminProductEditorProps {
  product: Product;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export default function AdminProductEditor({ product, onClose, onSave, onDeleteProduct }: AdminProductEditorProps) {
  // Local state for basic fields
  const [productName, setProductName] = useState<string>(product.name);
  const [description, setDescription] = useState<string>(product.description);
  const [basePrice, setBasePrice] = useState<number>(product.basePrice);
  const [minQty, setMinQty] = useState<number>(product.minQty);
  const [materials, setMaterials] = useState<MaterialOption[]>([...product.materials]);
  const [finishings, setFinishings] = useState<FinishingOption[]>([...product.finishings]);
  const [imageGradient, setImageGradient] = useState<string>(product.imageGradient || 'from-sky-500 to-indigo-600');
  const [iconName, setIconName] = useState<string>(product.iconName || 'Printer');
  const [customImageUrl, setCustomImageUrl] = useState<string>(product.customImageUrl || '');
  const [unit, setUnit] = useState<string>(product.unit || 'pcs');
  const [category, setCategory] = useState<string>(product.category || 'banner');
  const [error, setError] = useState<string>('');

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

  // Local state for Grid Prices (for 'grid' pricing products like Cetak Buku Custom)
  const [gridPrices, setGridPrices] = useState(
    product.gridPrices ? JSON.parse(JSON.stringify(product.gridPrices)) : null
  );

  // States for adding a new material option
  const [newMatName, setNewMatName] = useState('');
  const [newMatPrice, setNewMatPrice] = useState<number>(0);

  // States for adding a new finishing option
  const [newFinName, setNewFinName] = useState('');
  const [newFinPrice, setNewFinPrice] = useState<number>(0);
  const [newFinDesc, setNewFinDesc] = useState('');
  const [newFinIsPerUnit, setNewFinIsPerUnit] = useState(true);

  // State for deleting product confirmation modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Clear all materials
  const handleClearAllMaterials = () => {
    setMaterials([]);
  };

  // Clear all finishings
  const handleClearAllFinishings = () => {
    setFinishings([]);
  };

  // State for adding a new pages row to the pricing grid
  const [newPageNumber, setNewPageNumber] = useState<number>(320);

  // Active Editor Section Tab
  const [activeTab, setActiveTab] = useState<'general' | 'materials' | 'finishings' | 'grid'>('general');

  // Handle price/extraPrice changes
  const handleMaterialPriceChange = (index: number, value: string) => {
    const updated = [...materials];
    const num = parseInt(value) || 0;
    updated[index] = { ...updated[index], extraPrice: num };
    setMaterials(updated);
  };

  const handleMaterialNameChange = (index: number, value: string) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], name: value };
    setMaterials(updated);
  };

  const handleFinishingFieldChange = (index: number, field: keyof FinishingOption, value: any) => {
    const updated = [...finishings];
    updated[index] = { ...updated[index], [field]: value } as FinishingOption;
    setFinishings(updated);
  };

  // Add Material Manual
  const handleAddMaterial = () => {
    if (!newMatName.trim()) {
      alert('Nama bahan material tidak boleh kosong!');
      return;
    }
    const id = `mat-${Date.now()}`;
    setMaterials([
      ...materials,
      { id, name: newMatName.trim(), extraPrice: newMatPrice }
    ]);
    setNewMatName('');
    setNewMatPrice(0);
  };

  // Remove Material
  const handleRemoveMaterial = (id: string) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  // Add Finishing Manual
  const handleAddFinishing = () => {
    if (!newFinName.trim()) {
      alert('Nama opsi finishing tidak boleh kosong!');
      return;
    }
    const id = `fin-${Date.now()}`;
    setFinishings([
      ...finishings,
      { 
        id, 
        name: newFinName.trim(), 
        price: newFinPrice, 
        description: newFinDesc.trim() || 'Finishing custom tambahan', 
        isPerUnit: newFinIsPerUnit 
      }
    ]);
    setNewFinName('');
    setNewFinPrice(0);
    setNewFinDesc('');
    setNewFinIsPerUnit(true);
  };

  // Remove Finishing
  const handleRemoveFinishing = (id: string) => {
    setFinishings(finishings.filter((f) => f.id !== id));
  };

  // Handle cell price edit in Pricelist Grid
  const handleGridCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (!gridPrices) return;
    const updatedRows = [...gridPrices.rows];
    const num = parseInt(value) || 0;
    updatedRows[rowIndex].prices[colIndex] = num;
    setGridPrices({
      ...gridPrices,
      rows: updatedRows
    });
  };

  // Add Page Row manually to Pricelist Grid (matches Picture 1 list)
  const handleAddGridRow = () => {
    if (!gridPrices) return;
    if (newPageNumber <= 0) {
      alert('Jumlah halaman harus lebih dari 0!');
      return;
    }
    if (gridPrices.rows.some((r: any) => r.pages === newPageNumber)) {
      alert('Halaman tersebut sudah ada di tabel grid!');
      return;
    }

    // copy prices of last row as a baseline for easy editing
    const lastRow = gridPrices.rows[gridPrices.rows.length - 1];
    const defaultPrices = lastRow ? [...lastRow.prices] : Array(gridPrices.tiers.length).fill(basePrice);

    const newRow = { pages: newPageNumber, prices: defaultPrices };
    const updatedRows = [...gridPrices.rows, newRow].sort((a, b) => a.pages - b.pages);

    setGridPrices({
      ...gridPrices,
      rows: updatedRows
    });
  };

  // Delete page row from Pricelist Grid
  const handleRemoveGridRow = (pages: number) => {
    if (!gridPrices) return;
    if (gridPrices.rows.length <= 1) {
      alert('Tabel grid minimal harus memiliki 1 baris data harga!');
      return;
    }
    setGridPrices({
      ...gridPrices,
      rows: gridPrices.rows.filter((r: any) => r.pages !== pages)
    });
  };

  // Submit all changes back to App.tsx central database state
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setError('Nama jasa tidak boleh kosong.');
      return;
    }
    if (basePrice <= 0) {
      setError('Harga dasar produk harus lebih besar dari Rp 0.');
      return;
    }
    if (minQty < 1) {
      setError('Kuantitas minimal order harus minimal 1.');
      return;
    }

    const updatedProduct: Product = {
      ...product,
      name: productName.trim(),
      description: description.trim(),
      basePrice,
      minQty,
      unit,
      category: category as any,
      imageGradient,
      iconName,
      customImageUrl,
      materials,
      finishings,
      gridPrices: gridPrices || undefined
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div id="admin-editor-overlay" className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 md:items-center md:p-4 animate-fade-in">
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Main Container */}
      <div 
        id="admin-editor-body"
        className="w-full max-h-[92vh] md:max-h-[88vh] md:max-w-4xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-red-500/20"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-red-500/20 bg-red-600 px-5 py-4 text-white animate-fade-in" id="admin-editor-header">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
            <div>
              <h2 className="text-sm font-bold tracking-tight md:text-base">Database Cetakan & Harga (Admin Panel)</h2>
              <p className="text-[11px] text-red-100 font-medium">Mengelola {product.name}</p>
            </div>
          </div>
          <button 
            id="close-admin-editor"
            onClick={onClose} 
            className="rounded-lg p-1.5 text-red-200 hover:bg-red-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-4 py-1 gap-2" id="admin-editor-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'general'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Harga Dasar & Min Qty</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'materials'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Database Bahan ({materials.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finishings')}
            className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-bold border-b-2 transition ${
              activeTab === 'finishings'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <X className="h-3.5 w-3.5 rotate-45" />
            <span>Finishing ({finishings.length})</span>
          </button>

          {product.pricingType === 'grid' && (
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`flex items-center space-x-1 px-3 py-2.5 text-xs font-bold border-b-2 transition ${
                activeTab === 'grid'
                  ? 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>Tabel Pricelist Grid</span>
            </button>
          )}
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" id="admin-editor-form">
          {error && (
            <div className="flex items-center space-x-2 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-red-500 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: GENERAL CONFIGS */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in" id="admin-general-pane">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3.5 text-amber-800 dark:text-amber-400 text-xs leading-relaxed">
                <AlertCircle className="h-4 w-4 inline mr-1.5 shrink-0 -mt-0.5" />
                Mengubah nama, deskripsi, gambar visual utama, warna latar belakang, tipe hitung, dan harga dasar dari jasa cetak terpilih.
              </div>

              {/* LIVE CARD PREVIEW BLOCK */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-4 space-y-2.5">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Live Preview Tampilan Utama:</span>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
                  {/* Live Gradient/Icon Block */}
                  <div 
                    className={`w-28 h-28 shrink-0 rounded-xl flex items-center justify-center text-white relative shadow-inner overflow-hidden ${customImageUrl ? '' : `bg-gradient-to-br ${imageGradient}`}`}
                    style={customImageUrl ? { backgroundImage: `url(${customImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  >
                    {!customImageUrl && (
                      <>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:10px_10px] opacity-20"></div>
                        {iconName === 'Image' && <span className="text-2xl">🖼️</span>}
                        {iconName === 'Layers' && <span className="text-2xl">🥞</span>}
                        {iconName === 'FileText' && <span className="text-2xl">📄</span>}
                        {iconName === 'CreditCard' && <span className="text-2xl">💳</span>}
                        {iconName === 'Presentation' && <span className="text-2xl">📺</span>}
                        {iconName === 'Printer' && <span className="text-2xl">🖨️</span>}
                        {iconName === 'BookOpen' && <span className="text-2xl">📖</span>}
                        {iconName === 'Calendar' && <span className="text-2xl">📅</span>}
                        {iconName === 'HelpCircle' && <span className="text-2xl">❓</span>}
                      </>
                    )}
                  </div>
                  {/* Text Details Preview */}
                  <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
                    <span className="inline-block bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      {category}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">{productName || 'Nama Jasa Cetak'}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                      {description || 'Belum ada penjelasan deskripsi untuk produk ini.'}
                    </p>
                    <div className="pt-1.5 flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-[10px] font-semibold text-slate-400">Mulai dari</span>
                      <span className="text-xs font-black text-amber-500">Rp {formatIDR(basePrice)}/{unit}</span>
                      <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 rounded px-1.5">Min Qty: {minQty}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Category Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Nama Jasa Cetak
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Contoh: Cetak Spanduk Flexi"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-bold focus:border-red-500 focus:outline-hidden text-slate-850 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kategori Jasa
                  </label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Tulis nama kategori kustom (contoh: Banner, Merchandise, dll)"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-bold focus:border-red-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                  <datalist id="category-suggestions">
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

              {/* Description field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Deskripsi Jasa Utama
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tulis penjelasan singkat mengenai jasa cetak ini..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs focus:border-red-500 focus:outline-hidden text-slate-850 dark:text-slate-100 leading-relaxed"
                />
              </div>

              {/* Pricing, Unit and Min Qty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Harga Dasar Jasa (Rp)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="1"
                      value={basePrice}
                      onChange={(e) => setBasePrice(parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs font-bold focus:border-red-500 focus:outline-hidden text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Satuan Unit Cetak
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Contoh: m², lembar A3+, box, buku"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-bold focus:border-red-500 focus:outline-hidden text-slate-850 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Minimal Kuantitas Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minQty}
                    onChange={(e) => setMinQty(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 px-4 text-xs font-bold focus:border-red-500 focus:outline-hidden text-slate-850 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Customizing Gradient Background Preset */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ubah Warna Latar Belakang (Gradient CSS)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Ocean Blue', val: 'from-sky-500 to-indigo-600' },
                    { name: 'Warm Orange', val: 'from-amber-500 to-orange-600' },
                    { name: 'Fresh Teal', val: 'from-emerald-500 to-teal-600' },
                    { name: 'Luxury Purple', val: 'from-purple-500 to-pink-600' },
                    { name: 'Sunset Rose', val: 'from-pink-500 to-rose-600' },
                    { name: 'Royal Blue', val: 'from-blue-600 to-indigo-700' },
                    { name: 'Deep Cyber', val: 'from-fuchsia-600 to-purple-800' },
                    { name: 'Metal Gray', val: 'from-slate-700 to-slate-900' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setImageGradient(preset.val)}
                      className={`flex items-center space-x-2 rounded-lg border p-2 text-left text-xs transition ${
                        imageGradient === preset.val
                          ? 'border-red-500 bg-red-500/5 ring-1 ring-red-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`h-4 w-4 rounded bg-gradient-to-br ${preset.val} shadow-inner shrink-0`}></div>
                      <span className="font-bold truncate text-[10px] text-slate-700 dark:text-slate-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Input Custom Gradient CSS (Opsional):</span>
                  <input
                    type="text"
                    value={imageGradient}
                    onChange={(e) => setImageGradient(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-1.5 px-3 text-xs font-mono text-slate-800 dark:text-slate-100"
                    placeholder="from-sky-500 to-indigo-600"
                  />
                </div>
              </div>

              {/* Customizing Visual Icon */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ubah Ikon Visual Utama
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { label: '🥞 Layers (Stiker)', name: 'Layers' },
                    { label: '📄 FileText (Brosur)', name: 'FileText' },
                    { label: '💳 CreditCard (Kartu)', name: 'CreditCard' },
                    { label: '📺 Screen (Display)', name: 'Presentation' },
                    { label: '🖨️ Printer (General)', name: 'Printer' },
                    { label: '📖 BookOpen (Buku)', name: 'BookOpen' },
                    { label: '📅 Calendar (Kalender)', name: 'Calendar' },
                    { label: '🖼️ Image (Galeri/Foto)', name: 'Image' },
                    { label: '❓ HelpCircle (Tanya)', name: 'HelpCircle' }
                  ].map((ico) => (
                    <button
                      key={ico.name}
                      type="button"
                      onClick={() => setIconName(ico.name)}
                      className={`rounded-lg border p-2 text-center text-xs font-bold transition ${
                        iconName === ico.name
                          ? 'border-red-500 bg-red-500/5 text-red-600 dark:text-red-400'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] block truncate">{ico.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* UPLOAD FILE GAMBAR VISUAL UTAMA */}
              <div className="space-y-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 shadow-3xs">
                <div className="flex items-center space-x-2">
                  <span className="text-base">🖼️</span>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Upload File Gambar Visual Jasa Cetak
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Pilih file gambar asli dari komputer Anda (PNG, JPG, JPEG) untuk menggantikan gradient & ikon standard. Gambar akan dikonversi secara lokal dan langsung disimpan di dalam database browser secara offline, sehingga langsung terbaca di Netlify dan GitHub secara mulus!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <label className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-5 py-2.5 text-xs font-bold transition cursor-pointer shadow-sm">
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
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-5 py-2.5 text-xs font-bold transition shadow-xs"
                    >
                      <span>❌</span>
                      <span>Hapus Gambar Kustom (Gunakan Icon & Gradient)</span>
                    </button>
                  )}
                </div>

                {customImageUrl ? (
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1 animate-fade-in">
                    <span>✅</span>
                    <span>File gambar berhasil dimuat dan terintegrasi!</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-medium">
                    *Saat ini menggunakan visual standard (Gradient + Ikon)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE MATERIALS */}
          {activeTab === 'materials' && (
            <div className="space-y-6 animate-fade-in" id="admin-materials-pane">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-800 dark:text-amber-400 text-xs">
                Anda dapat <strong>menambah, mengubah, atau menghapus</strong> bahan kertas / material cetak di bawah secara manual. Harga bahan akan otomatis mengikuti database ini di kalkulator utama.
              </div>

              {/* 2a. Tambah Bahan Baru Form */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3.5" id="form-add-material">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                  <PlusCircle className="h-4 w-4 text-emerald-500" />
                  <span>Tambah Bahan Baru Manual</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Bahan Material</label>
                    <input
                      type="text"
                      placeholder="Contoh: Art Carton 260gr"
                      value={newMatName}
                      onChange={(e) => setNewMatName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-red-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tambahan Biaya (Rp)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={newMatPrice}
                        onChange={(e) => setNewMatPrice(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-8 pr-3 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="w-full md:w-auto inline-flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Masukkan Ke List Bahan</span>
                </button>
              </div>

              {/* 2b. List Bahan Saat Ini */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Daftar Bahan Yang Tersedia ({materials.length})
                  </label>
                  {materials.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllMaterials}
                      className="inline-flex items-center space-x-1 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Semua Bahan</span>
                    </button>
                  )}
                </div>

                {materials.length > 0 ? (
                  <div className="space-y-2" id="admin-materials-edit-list">
                    {materials.map((m, idx) => (
                      <div key={m.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
                        {/* Edit Name */}
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Bahan</label>
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => handleMaterialNameChange(idx, e.target.value)}
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-red-500 text-xs font-semibold py-0.5 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                          />
                        </div>

                        {/* Edit Price */}
                        <div className="w-full md:w-36 space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Biaya Tambah (Rp)</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-2.5 text-[10px] font-bold text-slate-400">Rp</span>
                            <input
                              type="number"
                              value={m.extraPrice}
                              onChange={(e) => handleMaterialPriceChange(idx, e.target.value)}
                              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-7 pr-2 text-xs font-bold text-right text-slate-850 dark:text-slate-100"
                            />
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(m.id)}
                          className="self-end md:self-center p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          title="Hapus Bahan ini"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                    Belum ada bahan di database. Silakan tambah bahan manual di atas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE FINISHINGS */}
          {activeTab === 'finishings' && (
            <div className="space-y-6 animate-fade-in" id="admin-finishings-pane">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-amber-800 dark:text-amber-400 text-xs">
                Mengatur opsi finishing / kelengkapan produk (misalnya jilid lem panas, laminasi, jilid ring, sudut rounded, dll).
              </div>

              {/* 3a. Tambah Finishing Form */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3.5" id="form-add-finishing">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                  <PlusCircle className="h-4 w-4 text-emerald-500" />
                  <span>Tambah Finishing Baru Manual</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Opsi Finishing</label>
                    <input
                      type="text"
                      placeholder="Contoh: Laminasi Doff"
                      value={newFinName}
                      onChange={(e) => setNewFinName(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Biaya Finishing (Rp)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={newFinPrice}
                        onChange={(e) => setNewFinPrice(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-8 pr-3 text-xs font-bold focus:outline-hidden focus:border-red-500 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newFinIsPerUnit}
                        onChange={(e) => setNewFinIsPerUnit(e.target.checked)}
                        className="rounded border-slate-300 text-red-500 focus:ring-red-500 h-4 w-4 bg-white dark:bg-slate-900"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Biaya dikalikan Qty</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Keterangan / Deskripsi Singkat</label>
                  <input
                    type="text"
                    placeholder="Contoh: Lapisan plastik tipis matte di kedua sisi agar kertas tidak mudah luntur."
                    value={newFinDesc}
                    onChange={(e) => setNewFinDesc(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs focus:outline-hidden focus:border-red-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddFinishing}
                  className="w-full md:w-auto inline-flex items-center justify-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Masukkan Ke List Finishing</span>
                </button>
              </div>

              {/* 3b. List Finishing Saat Ini */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Daftar Finishing Yang Tersedia ({finishings.length})
                  </label>
                  {finishings.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllFinishings}
                      className="inline-flex items-center space-x-1 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus Semua Finishing</span>
                    </button>
                  )}
                </div>

                {finishings.length > 0 ? (
                  <div className="space-y-2" id="admin-finishings-edit-list">
                    {finishings.map((f, idx) => (
                      <div key={f.id} className="flex flex-col space-y-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          {/* Finishing Name */}
                          <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Opsi</label>
                            <input
                              type="text"
                              value={f.name}
                              onChange={(e) => handleFinishingFieldChange(idx, 'name', e.target.value)}
                              className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-red-500 text-xs font-semibold py-0.5 focus:outline-hidden text-slate-800 dark:text-slate-200"
                            />
                          </div>

                          {/* Price */}
                          <div className="w-full md:w-36 space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">Biaya (Rp)</label>
                            <div className="relative flex items-center">
                              <span className="absolute left-2.5 text-[10px] font-bold text-slate-400">Rp</span>
                              <input
                                type="number"
                                value={f.price}
                                onChange={(e) => handleFinishingFieldChange(idx, 'price', parseInt(e.target.value) || 0)}
                                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-7 pr-2 text-xs font-bold text-right text-slate-850 dark:text-slate-100"
                              />
                            </div>
                          </div>

                          {/* Is Per Unit Checkbox */}
                          <div className="flex items-center pt-4 md:pt-0">
                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={f.isPerUnit}
                                onChange={(e) => handleFinishingFieldChange(idx, 'isPerUnit', e.target.checked)}
                                className="rounded border-slate-300 text-red-500 h-3.5 w-3.5"
                              />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">x Qty</span>
                            </label>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveFinishing(f.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition shrink-0 self-end md:self-center"
                            title="Hapus opsi finishing"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Description field */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Deskripsi</label>
                          <input
                            type="text"
                            value={f.description}
                            onChange={(e) => handleFinishingFieldChange(idx, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 focus:border-red-500 text-[10px] text-slate-500 py-0.5 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                    Belum ada opsi finishing di database. Silakan tambah opsi manual di atas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PRICELIST GRID CONFIGURATION (Buku / Novel Tiers) */}
          {activeTab === 'grid' && gridPrices && (
            <div className="space-y-6 animate-fade-in" id="admin-pricelist-grid-pane">
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-red-700 dark:text-red-400 text-xs leading-normal">
                <FileSpreadsheet className="h-4 w-4 inline mr-1.5 -mt-0.5 shrink-0" />
                <strong>Database Matriks Harga Jasa (Tabel Tier Grid)</strong>: Anda dapat mengatur harga buku secara presisi per jumlah halaman (baris) dan kuantitas cetak/eks (kolom) sama seperti di brosur pricelat toko Anda.
              </div>

              {/* 4a. Add New Page Row Form */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3" id="form-add-grid-row">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Tambah Baris Jumlah Halaman Baru Manual
                </h4>
                
                <div className="flex items-center space-x-3 max-w-sm">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="10"
                      min="10"
                      value={newPageNumber}
                      onChange={(e) => setNewPageNumber(parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 px-3 text-xs font-bold focus:outline-hidden focus:border-red-500 text-slate-800 dark:text-slate-100"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 uppercase">Halaman</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGridRow}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>
                <p className="text-[9px] text-slate-400">
                  *Sistem akan otomatis menduplikasi baris harga terdekat lalu mengurutkannya ke posisi yang tepat.
                </p>
              </div>

              {/* 4b. Grid Interactive Table */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Matriks Tabel Harga (Halaman vs Kuantitas Eks)
                </label>

                {/* Table wrapper for horizontal scroll */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-3xs" id="interactive-pricelist-table">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-950/80 font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-3.5 py-2.5 text-[10px] uppercase tracking-wider text-center sticky left-0 bg-slate-100 dark:bg-slate-950 z-10 border-r border-slate-200 dark:border-slate-800">
                          Ket / Hlm
                        </th>
                        {gridPrices.tiers.map((t: number) => (
                          <th key={t} className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider whitespace-nowrap min-w-28">
                            {t} Eks
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 font-medium">
                      {gridPrices.rows.map((row: any, rIdx: number) => (
                        <tr key={row.pages} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          {/* Row Header (Halaman) */}
                          <td className="px-3.5 py-2 text-center font-extrabold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800 sticky left-0 z-10 whitespace-nowrap">
                            {row.pages} hlm
                          </td>

                          {/* Editable Cells */}
                          {row.prices.map((p: number, cIdx: number) => (
                            <td key={cIdx} className="px-1.5 py-1">
                              <div className="relative flex items-center">
                                <span className="absolute left-1.5 text-[9px] font-bold text-slate-400">Rp</span>
                                <input
                                  type="number"
                                  value={p}
                                  onChange={(e) => handleGridCellChange(rIdx, cIdx, e.target.value)}
                                  className="w-full rounded border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-white dark:hover:bg-slate-950 focus:bg-white dark:focus:bg-slate-950 py-1 pl-5 pr-1 text-xs font-semibold text-right text-slate-800 dark:text-slate-100"
                                />
                              </div>
                            </td>
                          ))}

                          {/* Delete Row button */}
                          <td className="px-3 py-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveGridRow(row.pages)}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                              title={`Hapus baris ${row.pages} hlm`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              {onDeleteProduct && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="flex items-center space-x-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white px-3.5 py-2.5 text-xs font-bold transition shadow-2xs"
                  title="Hapus jasa cetak ini secara permanen dari katalog"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Hapus Jasa Ini</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 px-4 py-2.5 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                id="admin-editor-save-btn"
                className="flex items-center space-x-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 text-xs font-bold shadow-md transition"
              >
                <Save className="h-4 w-4" />
                <span>Simpan & Terapkan Database</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* MODAL KONFIRMASI HAPUS JASA */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Hapus Jasa Cetak Ini?</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus jasa <strong className="text-red-400">"{productName}"</strong> secara permanen dari database katalog?
              </p>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  if (onDeleteProduct) {
                    onDeleteProduct(product.id);
                  }
                  onClose();
                }}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs py-3 transition shadow-md flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Jasa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
