/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, LayoutGrid, CheckCircle2, ArrowRight, Tag, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { DesignTemplate, ProductCategory, Product } from '../types';
import { DESIGN_TEMPLATES } from '../data/templates';

interface DesignTemplatesModalProps {
  products: Product[];
  onSelectTemplate: (template: DesignTemplate, targetProduct: Product) => void;
  onClose: () => void;
}

export default function DesignTemplatesModal({
  products,
  onSelectTemplate,
  onClose
}: DesignTemplatesModalProps) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoriesList: { id: ProductCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'Semua Templat' },
    { id: 'banner', label: 'Spanduk & Banner' },
    { id: 'stiker', label: 'Stiker Kemasan' },
    { id: 'kartu_nama', label: 'Kartu Nama' },
    { id: 'brosur', label: 'Brosur & Flier' },
    { id: 'display', label: 'Display Booth' }
  ];

  const filteredTemplates = DESIGN_TEMPLATES.filter((tpl) => {
    const matchesCat = activeCategory === 'all' || tpl.category === activeCategory;
    const matchesQuery = !searchQuery || 
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handlePick = (tpl: DesignTemplate) => {
    // Find matching product by id or category
    const matched = products.find(p => p.id === tpl.suggestedProduct) || 
                    products.find(p => p.category === tpl.category) || 
                    products[0];
    onSelectTemplate(tpl, matched);
    onClose();
  };

  return (
    <motion.div
      id="design-templates-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>

      <motion.div
        initial={{ y: 20, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-2.5 text-slate-950 font-black shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Galeri Templat Desain Gratis</h3>
              <p className="text-xs text-slate-400">Pilih templat profesional siap pakai untuk langsung dipesan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
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
                className="group rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col justify-between hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl"
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
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {tpl.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-black/70 text-amber-400 backdrop-blur-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
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
    </motion.div>
  );
}
