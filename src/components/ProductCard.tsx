/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Image, Layers, FileText, CreditCard, Presentation, ArrowRight, Edit, Printer, BookOpen, Calendar, HelpCircle, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { formatIDR } from '../data';

const iconMap: Record<string, React.ComponentType<any>> = {
  Image,
  Layers,
  FileText,
  CreditCard,
  Presentation,
  Printer,
  BookOpen,
  Calendar,
  HelpCircle
};

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  key?: string | number;
  role?: 'buyer' | 'moderator';
  onAdminEdit?: (product: Product) => void;
  onViewMaterials?: (product: Product) => void;
  onDeleteProduct?: (productId: string) => void;
}

export default function ProductCard({ product, onSelect, role = 'buyer', onAdminEdit, onViewMaterials, onDeleteProduct }: ProductCardProps) {
  const IconComponent = iconMap[product.iconName] || Image;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-all duration-300 ease-out hover:scale-[1.025] hover:-translate-y-1.5 hover:border-amber-400/50 dark:hover:border-amber-500/30 hover:shadow-2xl hover:shadow-slate-300/40 dark:hover:shadow-slate-950/80 cursor-pointer"
      onClick={() => {
        if (role !== 'moderator') {
          onSelect(product);
        }
      }}
    >
      {/* Visual Header / Banner */}
      <div 
        className={`relative flex h-40 w-full items-center justify-center ${product.customImageUrl ? '' : `bg-gradient-to-br ${product.imageGradient}`} p-6 text-white cursor-zoom-in overflow-hidden`}
        style={product.customImageUrl ? { backgroundImage: `url(${product.customImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        id={`product-gradient-${product.id}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onViewMaterials) {
            onViewMaterials(product);
          } else {
            onSelect(product);
          }
        }}
      >
        {/* Subtle grid pattern background overlay */}
        {!product.customImageUrl && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
        )}
        
        {!product.customImageUrl && (
          <IconComponent className="h-16 w-16 text-white/90 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
        )}

        {/* Hover info overlay to view catalog */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            📖 Lihat Katalog Bahan
          </span>
        </div>
        
        <span 
          id={`product-cat-badge-${product.id}`}
          className="absolute top-3 right-3 rounded-full bg-black/30 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white z-10"
        >
          {product.category.replace('_', ' ')}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 md:p-5" id={`product-content-${product.id}`}>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-slate-800 dark:group-hover:text-white line-clamp-1" id={`product-title-${product.id}`}>
          {product.name}
        </h3>
        
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Spesifikasi Ringkas */}
        <div className="mt-3 flex flex-wrap gap-1" id={`product-specs-${product.id}`}>
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            Min. {product.minQty} {product.unit}
          </span>
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            {product.pricingType === 'area' ? 'Ukuran Bebas' : 'Pilihan Premium'}
          </span>
          <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            {product.materials.length} Bahan
          </span>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between" id={`product-footer-${product.id}`}>
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Mulai Dari</span>
            <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400 md:text-base" id={`product-price-${product.id}`}>
              {formatIDR(product.basePrice)}
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/{product.unit}</span>
            </span>
          </div>

          {role === 'moderator' ? (
            <div className="flex items-center space-x-1.5">
              {onDeleteProduct && (
                <button
                  id={`btn-admin-delete-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProduct(product.id);
                  }}
                  className="flex items-center justify-center rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-all duration-200"
                  title="Hapus Jasa Cetak Ini Dari Katalog"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                id={`btn-admin-edit-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onAdminEdit) onAdminEdit(product);
                }}
                className="flex items-center space-x-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-500 transition-all duration-200"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit Harga</span>
              </button>
            </div>
          ) : (
            <button
              id={`btn-select-product-${product.id}`}
              onClick={() => onSelect(product)}
              className="flex items-center space-x-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 dark:hover:bg-amber-500 text-white dark:text-slate-200 px-3.5 py-2 text-xs font-bold shadow-sm hover:bg-amber-500 hover:text-slate-950 transition-all duration-200"
            >
              <span>Pilih</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
