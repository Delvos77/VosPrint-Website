/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Image, Layers, FileText, CreditCard, Presentation, ArrowRight, Edit, Printer, BookOpen, Calendar, HelpCircle, Trash2, Share2, Check } from 'lucide-react';
import { motion } from 'motion/react';
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
  const [isCopied, setIsCopied] = useState(false);

  // Format short spec description
  const getSubSpec = () => {
    const catLabel = product.category.replace('_', ' ').toUpperCase();
    const primaryMat = product.materials[0]?.name.split('(')[0].trim() || `${product.materials.length} Bahan`;
    return `${catLabel} · ${primaryMat}`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}?product=${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `vosprint - ${product.name}`,
          text: product.description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div 
      id={`product-card-${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#2e333d] dark:border-white/10 bg-[#1c1e24] dark:bg-[#121316] text-neutral-200 dark:text-white shadow-md dark:shadow-xl transition-all duration-300 ease-out hover:border-[#424b59] dark:hover:border-white/25 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-black/70 cursor-pointer"
      onClick={() => {
        if (role !== 'moderator') {
          onSelect(product);
        }
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Visual Header / Banner Image Mockup */}
      <div 
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#14161b] dark:bg-[#181a20]"
        id={`product-gradient-${product.id}`}
      >
        {product.customImageUrl ? (
          <img
            src={product.customImageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br ${product.imageGradient} p-6`}>
            <IconComponent className="h-16 w-16 text-white/90 transition-transform duration-500 group-hover:scale-110 drop-shadow-md" />
          </div>
        )}

        {/* Subtle Dark Vignette at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1e24]/90 dark:from-[#121316] via-transparent to-black/20 opacity-70 group-hover:opacity-40 transition-opacity"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span 
            id={`product-cat-badge-${product.id}`}
            className="rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white border border-white/20 shadow-sm pointer-events-none"
          >
            {product.category.replace('_', ' ')}
          </span>

          <div className="flex items-center gap-1.5">
            {product.pricingType === 'grid' && (
              <span className="rounded-full bg-amber-500 text-slate-950 px-2 py-0.5 text-[9px] font-black tracking-wide shadow-sm pointer-events-none">
                TIER GRID
              </span>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md p-1.5 text-white border border-white/20 shadow-sm transition-all"
              title="Bagikan Jasa Ini"
            >
              {isCopied ? <Check className="h-3 w-3 text-green-400" /> : <Share2 className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-xs p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="rounded-full bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-extrabold text-xs px-4 py-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex items-center space-x-1.5"
          >
            <span>Hitung & Pesan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          {onViewMaterials && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewMaterials(product);
              }}
              className="rounded-full bg-white/90 text-black hover:bg-white dark:bg-neutral-900/90 dark:hover:bg-neutral-800 dark:text-white font-bold text-xs px-3.5 py-2 border border-black/20 dark:border-white/20 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
              title="Lihat Spesifikasi & Database Bahan"
            >
              Info Bahan
            </button>
          )}
        </div>
      </div>

      {/* Card Footer Details (Comfort Dark / Dim theme) */}
      <div className="flex flex-col p-4 sm:p-5 justify-between flex-1 bg-[#1c1e24] dark:bg-[#121316]" id={`product-content-${product.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 
              className="text-sm md:text-base font-bold text-white dark:text-white tracking-tight group-hover:text-amber-400 dark:group-hover:text-[#FFCC00] transition-colors truncate" 
              id={`product-title-${product.id}`}
              title={product.name}
            >
              {product.name}
            </h3>
            
            <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-400 font-medium tracking-normal truncate">
              {getSubSpec()}
            </p>
            {product.description && (
              <p className="mt-2 text-xs text-neutral-300 dark:text-neutral-300 line-clamp-2 leading-relaxed" id={`product-desc-${product.id}`}>
                {product.description}
              </p>
            )}
          </div>

          {/* Price on right */}
          <div className="text-right shrink-0">
            <span className="text-sm md:text-base font-black text-white dark:text-white tracking-tight" id={`product-price-${product.id}`}>
              {formatIDR(product.basePrice)}
            </span>
            <span className="block text-[10px] text-neutral-400 dark:text-neutral-400 font-medium -mt-0.5">
              /{product.unit}
            </span>
          </div>
        </div>

        {/* Moderator / Admin Actions */}
        {role === 'moderator' && (
          <div className="mt-4 pt-3 border-t border-[#2e333d] dark:border-white/10 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] text-amber-400 dark:text-amber-400 font-bold uppercase tracking-wider">Akses Admin</span>
            <div className="flex items-center space-x-1.5">
              {onDeleteProduct && (
                <button
                  id={`btn-admin-delete-${product.id}`}
                  onClick={() => onDeleteProduct(product.id)}
                  className="flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition"
                  title="Hapus Jasa Ini Dari Katalog"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                id={`btn-admin-edit-${product.id}`}
                onClick={() => {
                  if (onAdminEdit) onAdminEdit(product);
                }}
                className="flex items-center space-x-1 rounded-lg bg-red-600 hover:bg-red-500 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition"
              >
                <Edit className="h-3 w-3" />
                <span>Edit Harga</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
