/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Edit3, Image as ImageIcon, Save, Check, HelpCircle, Sparkles, BookOpen, Calculator, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, MaterialOption } from '../types';
import { formatIDR } from '../data';

interface MaterialCatalogModalProps {
  product: Product;
  role: 'buyer' | 'moderator';
  onClose: () => void;
  onSaveMaterials: (productId: string, updatedMaterials: MaterialOption[]) => void;
  onSelectProduct?: (product: Product) => void;
}

// Curated high-res texture presets for instant premium selection
const MATERIAL_PRESETS = [
  { id: 'preset-matte', name: 'Kertas Matte / Doff', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80', desc: 'Permukaan halus tanpa pantulan cahaya, memberikan kesan elegan, tenang, dan premium.' },
  { id: 'preset-glossy', name: 'Kertas Glossy / Kilap', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80', desc: 'Permukaan mengkilap berkilau tinggi yang membuat warna cetakan tampil sangat kontras dan hidup.' },
  { id: 'preset-banner', name: 'Flexi Tarpaulin (Spanduk)', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80', desc: 'Serat PVC tebal yang tahan air, cuaca ekstrem, dan benturan, ideal untuk pemasangan spanduk outdoor.' },
  { id: 'preset-textured', name: 'Linen / Fancy Paper', url: 'https://images.unsplash.com/photo-1562184760-a11b3cf7c169?auto=format&fit=crop&w=400&q=80', desc: 'Tekstur anyaman benang mewah, menambah dimensi taktil berkelas untuk undangan, kartu, atau cover buku.' },
  { id: 'preset-vinyl', name: 'Vinyl Waterproof Sticker', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80', desc: 'Lapisan sintetis semi-plastik lentur yang 100% tahan air dan tidak mudah sobek.' },
  { id: 'preset-canvas', name: 'Luster Premium', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80', desc: 'Tekstur kilau pasir micro (satin) yang menahan pantulan berlebih namun menjaga ketajaman resolusi tinggi.' }
];

export default function MaterialCatalogModal({
  product,
  role,
  onClose,
  onSaveMaterials,
  onSelectProduct
}: MaterialCatalogModalProps) {
  // Local state for material definitions
  const [materials, setMaterials] = useState<MaterialOption[]>(() => {
    // Inject default descriptions and images if missing to prevent empty slop state
    return product.materials.map(mat => ({
      ...mat,
      description: mat.description || getFallbackDescription(product.id, mat.name),
      imageUrl: mat.imageUrl || getFallbackImageUrl(product.id, mat.id)
    }));
  });

  // State to track which material is being edited (by index)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Temporary edit states
  const [tempDesc, setTempDesc] = useState('');
  const [tempUrl, setTempUrl] = useState('');
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [tempName, setTempName] = useState('');
  
  // Save confirmation notification
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fallback default description generator
  function getFallbackDescription(prodId: string, matName: string): string {
    if (prodId.includes('spanduk') || prodId.includes('banner')) {
      return `Bahan serat sintetis tangguh tahan air dan cuaca panas. Sangat cocok untuk promosi luar ruangan, baliho, maupun papan informasi toko. Menawarkan reproduksi warna solid dan tidak gampang sobek.`;
    }
    if (prodId.includes('stiker')) {
      return `Bahan stiker berperekat kuat dengan presisi rekat yang merata. Ideal untuk branding botol minuman, toples makanan, stiker komunitas, maupun label kemasan produk usaha mikro.`;
    }
    if (prodId.includes('buku') || prodId.includes('novel')) {
      return `Bahan premium berkualitas tinggi dengan ketebalan bersertifikat. Serat kertas rapi yang menyerap tinta buku secara merata untuk teks yang tajam dan nyaman dibaca berjam-jam.`;
    }
    return `Bahan pilihan berkualitas tinggi bertekstur premium. Dirancang khusus untuk hasil cetak yang tahan lama, tajam, dan memiliki akurasi warna tinggi sesuai desain asli Anda.`;
  }

  // Fallback default image generator
  function getFallbackImageUrl(prodId: string, matId: string): string {
    if (prodId.includes('spanduk') || prodId.includes('banner')) {
      return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=400&q=80'; // Tarpaulin banner
    }
    if (prodId.includes('stiker')) {
      return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'; // Colorful stickers/abstract
    }
    if (prodId.includes('buku') || prodId.includes('novel')) {
      return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80'; // Clean paper texture
    }
    return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80'; // Universal texture
  }

  // Start editing a material card
  const handleStartEdit = (index: number) => {
    const target = materials[index];
    setEditingIndex(index);
    setTempName(target.name);
    setTempDesc(target.description || '');
    setTempUrl(target.imageUrl || '');
    setTempPrice(target.extraPrice);
  };

  const handleTempImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file gambar terlalu besar (Maksimal 2MB). Silakan pilih gambar yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setTempUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectCardImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file gambar terlalu besar (Maksimal 2MB). Silakan pilih gambar yang lebih kecil.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = [...materials];
        updated[index] = {
          ...updated[index],
          imageUrl: base64
        };
        setMaterials(updated);
        if (editingIndex === index) {
          setTempUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Keep changes locally
  const handleSaveItemChanges = (index: number) => {
    const updated = [...materials];
    updated[index] = {
      ...updated[index],
      name: tempName,
      description: tempDesc,
      imageUrl: tempUrl,
      extraPrice: Number(tempPrice)
    };
    setMaterials(updated);
    setEditingIndex(null);
  };

  // Apply changes to global products database (and trigger persistence)
  const handleApplyGlobalChanges = () => {
    onSaveMaterials(product.id, materials);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  return (
    <motion.div 
      id="material-catalog-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      {/* Main Dialog */}
      <motion.div 
        id="material-catalog-dialog"
        initial={{ y: 25, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-900 px-6 py-4 text-white" id="catalog-modal-header">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold md:text-lg">Katalog Galeri Bahan Cetak</h2>
                {role === 'moderator' && (
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-400">
                    Mode Moderator (Bisa Edit)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">{product.name} — Visualisasi & Karakteristik Bahan</p>
            </div>
          </div>
          <button 
            id="close-catalog-modal"
            onClick={onClose} 
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Catalog Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6" id="catalog-modal-scroll-area">
          
          {/* Top Banner / Explanation */}
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Mengenal Karakter Bahan Cetak Anda</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                Setiap jenis bahan memiliki karakteristik visual, ketebalan, ketahanan, dan tekstur yang berbeda. Klik katalog bahan di bawah untuk mempermudah Anda menentukan pilihan bahan yang paling tepat untuk proyek cetak Anda.
              </p>
            </div>
            {role !== 'moderator' && onSelectProduct && (
              <button
                id="catalog-open-calculator-btn"
                onClick={() => {
                  onClose();
                  onSelectProduct(product);
                }}
                className="flex items-center space-x-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 shadow-md transition whitespace-nowrap shrink-0"
              >
                <Calculator className="h-4 w-4" />
                <span>Buka Kalkulator Harga</span>
              </button>
            )}
          </div>

          {/* Grid of Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="catalog-materials-grid">
            {materials.map((mat, index) => {
              const isEditing = editingIndex === index;

              return (
                <div 
                  key={mat.id}
                  id={`catalog-material-card-${mat.id}`}
                  className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Card Visual Header */}
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-900 overflow-hidden group-card">
                    <img 
                      src={mat.imageUrl || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80'} 
                      alt={mat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
                      {mat.extraPrice === 0 ? 'Harga Standard' : `+ ${formatIDR(mat.extraPrice)}`}
                    </div>

                    {role === 'moderator' && (
                      <label className="absolute bottom-2 left-2 cursor-pointer rounded-lg bg-black/75 hover:bg-emerald-600 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-white flex items-center space-x-1.5 transition shadow-md border border-white/20">
                        <Upload className="h-3 w-3 text-amber-400 shrink-0" />
                        <span>Pilih File Gambar</span>
                        <input type="file" accept="image/*" onChange={(e) => handleDirectCardImageUpload(index, e)} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Card Main Area */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    {isEditing ? (
                      /* EDITING MODE */
                      <div className="space-y-3.5 flex-1" id={`material-editor-panel-${index}`}>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                            Nama Bahan (Dari Tab Bahan)
                          </label>
                          <input 
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-1.5 px-3 text-xs font-semibold focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                            Deskripsi Visual & Karakteristik
                          </label>
                          <textarea 
                            rows={3}
                            value={tempDesc}
                            onChange={(e) => setTempDesc(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-1.5 px-3 text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-slate-100 leading-relaxed"
                            placeholder="Tulis penjelasan ketebalan, kelenturan, ketajaman warna atau kegunaan terbaik bahan..."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                            Biaya Tambahan ({product.unit})
                          </label>
                          <div className="relative rounded-lg shadow-xs">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">Rp</span>
                            <input 
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(Number(e.target.value))}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-1.5 pl-8 pr-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                            Gambar Bahan (Upload File atau URL)
                          </label>
                          <div className="flex gap-2 items-center">
                            <input 
                              type="text"
                              value={tempUrl}
                              onChange={(e) => setTempUrl(e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono truncate"
                              placeholder="https://... atau upload file"
                            />
                            <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-2 rounded-lg flex items-center space-x-1 shrink-0 shadow-xs transition">
                              <Upload className="h-3 w-3 text-white shrink-0" />
                              <span>Pilih File</span>
                              <input type="file" accept="image/*" onChange={handleTempImageUpload} className="hidden" />
                            </label>
                          </div>

                          {/* Quick Presets Selector */}
                          <div className="mt-2 space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Atau Pilih Preset Tekstur Cepat:</span>
                            <div className="grid grid-cols-3 gap-1">
                              {MATERIAL_PRESETS.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setTempUrl(p.url);
                                    if (!tempDesc) {
                                      setTempDesc(p.desc);
                                    }
                                  }}
                                  className="text-[9px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 p-1 rounded border border-slate-200/50 dark:border-slate-700/50 transition truncate text-left"
                                  title={p.desc}
                                >
                                  {p.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Save Action Buttons on Card */}
                        <div className="pt-2 flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingIndex(null)}
                            className="rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] px-2.5 py-1.5 transition"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveItemChanges(index)}
                            className="flex items-center space-x-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2.5 py-1.5 transition"
                          >
                            <Check className="h-3 w-3" />
                            <span>Terapkan</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* SPECTATOR / BUYER READ-ONLY MODE */
                      <div className="flex flex-col justify-between h-full flex-1 space-y-3">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-amber-500">
                            {mat.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {mat.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Harga Bahan</span>
                            <span className="text-xs font-black text-amber-500">
                              {mat.extraPrice === 0 ? 'Sesuai Harga Dasar' : `+ ${formatIDR(mat.extraPrice)} / ${product.unit}`}
                            </span>
                          </div>

                          {role === 'moderator' ? (
                            <button
                              id={`edit-material-btn-${mat.id}`}
                              onClick={() => handleStartEdit(index)}
                              className="flex items-center space-x-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 dark:hover:bg-amber-500 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-950 font-bold text-[10px] px-2.5 py-1.5 transition"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Edit Visual</span>
                            </button>
                          ) : (
                            onSelectProduct && (
                              <button
                                id={`select-material-calc-btn-${mat.id}`}
                                onClick={() => {
                                  onClose();
                                  onSelectProduct(product);
                                }}
                                className="flex items-center space-x-1 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 dark:hover:text-amber-500 text-[10px] font-bold px-2.5 py-1.5 transition"
                              >
                                <span>Pilih</span>
                                <Calculator className="h-3 w-3" />
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer (For Moderator Database Persistence Actions) */}
        {role === 'moderator' && (
          <div className="sticky bottom-0 z-10 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-6 py-4 flex items-center justify-between" id="catalog-modal-footer">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span>Satu langkah lagi! Klik Simpan Database untuk mempublikasikan perubahan Anda.</span>
            </div>

            <div className="flex space-x-3">
              <button
                id="cancel-material-catalog-global"
                onClick={onClose}
                className="rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2 px-4 transition"
              >
                Tutup
              </button>
              <button
                id="save-material-catalog-global"
                onClick={handleApplyGlobalChanges}
                className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs py-2 px-5 shadow-md transition transform active:scale-98"
              >
                <Save className="h-4 w-4" />
                <span>Simpan Database</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Save Indicator Alert */}
        {savedSuccess && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 rounded-xl bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 shadow-lg flex items-center space-x-2 animate-fade-in" id="global-catalog-success">
            <Check className="h-4 w-4" />
            <span>Perubahan katalog bahan berhasil disimpan ke Database utama!</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
