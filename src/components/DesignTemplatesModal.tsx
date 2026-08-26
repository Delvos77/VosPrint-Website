/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, LayoutGrid, ArrowRight, Search, Plus, Trash2, Edit3, Image, Tag, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DesignTemplate, ProductCategory, Product } from '../types';
import { DESIGN_TEMPLATES } from '../data/templates';
import { fetchCentralStoreData, syncTemplatesToServer } from '../utils/storeApi';

interface DesignTemplatesModalProps {
  products: Product[];
  role?: 'buyer' | 'moderator';
  onSelectTemplate: (template: DesignTemplate, targetProduct: Product) => void;
  onClose: () => void;
}

export default function DesignTemplatesModal({
  products,
  role = 'buyer',
  onSelectTemplate,
  onClose
}: DesignTemplatesModalProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Load templates from localStorage or fallback to default DESIGN_TEMPLATES
  const [templates, setTemplates] = useState<DesignTemplate[]>(() => {
    const saved = localStorage.getItem('cetakinstan_custom_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DESIGN_TEMPLATES;
      }
    }
    return DESIGN_TEMPLATES;
  });

  // Fetch templates from server on mount
  useEffect(() => {
    fetchCentralStoreData().then((data) => {
      if (data?.templates && Array.isArray(data.templates) && data.templates.length > 0) {
        setTemplates(data.templates);
        localStorage.setItem('cetakinstan_custom_templates', JSON.stringify(data.templates));
      }
    });
  }, []);

  // Save to localStorage & sync to centralized server when templates change
  const saveTemplates = (newList: DesignTemplate[]) => {
    setTemplates(newList);
    localStorage.setItem('cetakinstan_custom_templates', JSON.stringify(newList));
    syncTemplatesToServer(newList);
  };

  // State for Add/Edit Form Modal
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<DesignTemplate | null>(null);

  // Form Fields (Category & Product Terkait are optional, default is empty or "banner")
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<ProductCategory | ''>('banner');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formSuggestedProduct, setFormSuggestedProduct] = useState<string>('spanduk-flexi');
  const [formError, setFormError] = useState<string>('');

  // Confirm Delete State
  const [deletingTemplate, setDeletingTemplate] = useState<DesignTemplate | null>(null);

  // Image Upload handler for local file to base64
  const handleTemplateImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFormError('Ukuran file gambar terlalu besar! Silakan gunakan gambar di bawah 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
          setFormError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const categoriesList: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Semua Templat' },
    { id: 'banner', label: 'Spanduk & Banner' },
    { id: 'stiker', label: 'Stiker Kemasan' },
    { id: 'kartu_nama', label: 'Kartu Nama' },
    { id: 'brosur', label: 'Brosur & Flier' },
    { id: 'display', label: 'Display Booth' }
  ];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCat = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesQuery = !searchQuery || 
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handlePick = (tpl: DesignTemplate) => {
    const matched = products.find(p => p.id === tpl.suggestedProduct) || 
                    products.find(p => p.category === tpl.category) || 
                    products[0];
    onSelectTemplate(tpl, matched);
    onClose();
  };

  // Open Form for Adding New Template
  const handleOpenAddForm = () => {
    setEditingTemplate(null);
    setFormTitle('');
    setFormCategory(''); // Kategori opsional
    setFormImageUrl('');
    setFormTags('Promosi, Toko, Baru');
    setFormDescription('Desain templat kustom siap pakai untuk pemesanan cepat.');
    setFormSuggestedProduct(''); // Produk Terkait opsional
    setFormError('');
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing Template
  const handleOpenEditForm = (tpl: DesignTemplate) => {
    setEditingTemplate(tpl);
    setFormTitle(tpl.title);
    setFormCategory(tpl.category || '');
    setFormImageUrl(tpl.imageUrl);
    setFormTags(tpl.tags.join(', '));
    setFormDescription(tpl.description);
    setFormSuggestedProduct(tpl.suggestedProduct || '');
    setFormError('');
    setIsFormOpen(true);
  };

  // Save Form Handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Judul templat tidak boleh kosong.');
      return;
    }

    if (!formImageUrl.trim()) {
      setFormError('URL gambar templat wajib diisi.');
      return;
    }

    const tagArray = formTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    if (editingTemplate) {
      // Edit mode
      const updated = templates.map(t => {
        if (t.id === editingTemplate.id) {
          return {
            ...t,
            title: formTitle.trim(),
            category: formCategory || undefined,
            imageUrl: formImageUrl.trim(),
            tags: tagArray.length > 0 ? tagArray : ['Templat'],
            description: formDescription.trim(),
            suggestedProduct: formSuggestedProduct || undefined
          };
        }
        return t;
      });
      saveTemplates(updated);
    } else {
      // Add mode
      const newTpl: DesignTemplate = {
        id: 'tpl-custom-' + Date.now(),
        title: formTitle.trim(),
        category: formCategory || undefined,
        imageUrl: formImageUrl.trim(),
        tags: tagArray.length > 0 ? tagArray : ['Baru'],
        description: formDescription.trim(),
        suggestedProduct: formSuggestedProduct || undefined
      };
      saveTemplates([newTpl, ...templates]);
    }

    setIsFormOpen(false);
  };

  // Delete Template Handler
  const handleConfirmDelete = () => {
    if (!deletingTemplate) return;
    const updated = templates.filter(t => t.id !== deletingTemplate.id);
    saveTemplates(updated);
    setDeletingTemplate(null);
  };

  return (
    <motion.div
      id="design-templates-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      <motion.div
        initial={{ y: 20, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-2.5 text-slate-950 font-black shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white">Galeri Templat Desain Gratis</h3>
                {role === 'moderator' && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    Mode Moderator
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Pilih templat profesional siap pakai untuk langsung dipesan</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {role === 'moderator' && (
              <button
                onClick={handleOpenAddForm}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2 px-3 transition shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Tambah Templat</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari templat (e.g. Warung, Laundry, Minuman, Minimalis)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex overflow-x-auto pb-1 scrollbar-none gap-2">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 transition ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 space-y-2">
              <LayoutGrid className="h-10 w-10 mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-400">Tidak ada templat ditemukan</p>
              <p className="text-xs">Coba ubah kata kunci atau kategori filter Anda.</p>
            </div>
          ) : (
            filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl"
              >
                <div>
                  {/* Thumbnail Image */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                    <img
                      src={tpl.imageUrl}
                      alt={tpl.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* Tags */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1 pr-16">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-black/70 text-amber-400 backdrop-blur-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* MODERATOR ACTION CONTROLS ON CARD */}
                    {role === 'moderator' && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-black/80 backdrop-blur-xs p-1 rounded-xl border border-slate-700">
                        <button
                          onClick={() => handleOpenEditForm(tpl)}
                          className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                          title="Edit Templat"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTemplate(tpl)}
                          className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition"
                          title="Hapus Templat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-1.5">
                    <h4 className="text-xs font-extrabold text-white group-hover:text-amber-400 transition">
                      {tpl.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handlePick(tpl)}
                    className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-2 px-3 transition shadow-md"
                  >
                    <span>Gunakan Templat Ini</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* FORM MODAL: ADD / EDIT TEMPLATE (MODERATOR ONLY) */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          >
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-extrabold">
                  {editingTemplate ? 'Edit Templat Desain' : 'Tambah Templat Baru'}
                </h3>
              </div>

               <form onSubmit={handleSaveForm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Judul Templat *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Contoh: Spanduk Kuliner & Warung Makan"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Kategori (Opsional)
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProductCategory | '')}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Tanpa Kategori (Opsional) --</option>
                      <option value="banner">Spanduk & Banner</option>
                      <option value="stiker">Stiker Kemasan</option>
                      <option value="kartu_nama">Kartu Nama</option>
                      <option value="brosur">Brosur & Flier</option>
                      <option value="display">Display Booth</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Produk Terkait (Opsional)
                    </label>
                    <select
                      value={formSuggestedProduct}
                      onChange={(e) => setFormSuggestedProduct(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="">-- Tanpa Produk Terkait (Opsional) --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Foto / Gambar Templat *
                  </label>
                  
                  {/* Local Photo Upload Area */}
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-3 text-center space-y-2">
                    <span className="text-xl block">🖼️</span>
                    <p className="text-[10px] text-slate-400">
                      Upload foto langsung dari komputer Anda. Foto tersimpan otomatis di database browser, sinkron mulus ke GitHub & Netlify!
                    </p>
                    <label className="inline-flex items-center space-x-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-3.5 transition cursor-pointer shadow-xs">
                      <span>📁</span>
                      <span>Pilih File Gambar</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTemplateImageUpload}
                        className="hidden"
                      />
                    </label>
                    {formImageUrl && formImageUrl.startsWith('data:') && (
                      <div className="text-[9px] text-emerald-400 font-bold">
                        ✓ Gambar Berhasil Diupload dari Lokal!
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium mb-1">Atau masukkan URL Gambar Manual:</span>
                    <input
                      type="text"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {formImageUrl && (
                    <div className="relative h-24 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mt-2">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/80 hover:bg-black text-white transition text-[9px]"
                        title="Hapus gambar"
                      >
                        ❌
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tag / Hastag (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Warung, Spanduk, Kuliner, Promosi"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Deskripsi Templat
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Jelaskan keunggulan dan tata letak templat ini..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs font-medium text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-950/50 border border-red-900 text-xs font-bold text-red-400 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-3 transition shadow-md flex items-center justify-center space-x-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>{editingTemplate ? 'Simpan Perubahan' : 'Tambah Templat'}</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {deletingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          >
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-2xl space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Hapus Templat ini?</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus templat <strong className="text-amber-400">"{deletingTemplate.title}"</strong>?
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setDeletingTemplate(null)}
                  className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs py-3 transition shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Ya, Hapus</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
