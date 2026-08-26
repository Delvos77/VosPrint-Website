/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Printer, 
  ShoppingBag, 
  Phone, 
  Clock, 
  Store, 
  Sun, 
  Moon, 
  Shield, 
  Edit3, 
  Sparkles, 
  Lock, 
  KeyRound,
  Instagram,
  MessageCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { ProductCategory, StoreHours } from '../types';
import VosPrintLogo from './VosPrintLogo';

interface NavbarProps {
  currentTab: 'catalog' | 'cart' | 'info' | 'orders';
  setCurrentTab: (tab: 'catalog' | 'cart' | 'info' | 'orders') => void;
  cartCount: number;
  openCartDrawer: () => void;
  categories: { id: ProductCategory; label: string }[];
  activeCategory: ProductCategory;
  setActiveCategory: (category: ProductCategory) => void;
  onOpenTemplatesModal?: () => void;
  
  // Theme and Role switching
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  role: 'buyer' | 'moderator';
  toggleRole: () => void;
  onOpenAdminPinModal?: () => void;
  onOpenAdminSecurityModal?: () => void;
  showAdminLock?: boolean;

  // Store Hours
  storeHours?: StoreHours;
  onOpenEditStoreHours?: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  cartCount,
  openCartDrawer,
  categories,
  activeCategory,
  setActiveCategory,
  onOpenTemplatesModal,
  theme,
  toggleTheme,
  role,
  toggleRole,
  onOpenAdminPinModal,
  onOpenAdminSecurityModal,
  showAdminLock = true,
  storeHours,
  onOpenEditStoreHours
}: NavbarProps) {
  const displayHours = storeHours || {
    openDays: 'Senin - Sabtu',
    openTime: '08:00',
    closeTime: '20:00',
    closedDaysInfo: 'Minggu & Hari Libur Tutup'
  };

  return (
    <>
      {/* ====== DESKTOP & TABLET TOP HEADER (Comfort & Elegant Theme) ====== */}
      <header 
        className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0c0d10]/95 backdrop-blur-md text-slate-800 dark:text-white transition-colors duration-500 shadow-xs dark:shadow-none"
        id="desktop-header"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          
          {/* 1. Left Logo (VosPrint Brand Mark & Wordmark) */}
          <button 
            onClick={() => { setCurrentTab('catalog'); setActiveCategory('all'); }} 
            className="flex items-center transition hover:opacity-90 text-left"
            id="nav-logo-btn"
            title="vosprint - Beranda"
          >
            <VosPrintLogo size="md" />
          </button>

          {/* 2. Center Pill Navigation (Comfort Adaptive Segmented Pill Menu) */}
          <nav className="hidden md:flex items-center bg-slate-100 dark:bg-[#15171d] border border-slate-200 dark:border-white/10 rounded-full p-1 shadow-inner text-xs font-semibold" id="desktop-nav-menu">
            <button
              id="tab-catalog-btn"
              onClick={() => { setCurrentTab('catalog'); setActiveCategory('all'); }}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                currentTab === 'catalog'
                  ? 'bg-[#FFCC00] text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              Discover
            </button>

            {onOpenTemplatesModal && (
              <button
                id="tab-templates-btn"
                onClick={onOpenTemplatesModal}
                className="px-3.5 py-1.5 rounded-full text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 transition-all duration-200 flex items-center space-x-1.5"
              >
                <span>Templates</span>
                <span className="bg-[#FFCC00]/15 text-amber-600 dark:bg-amber-500/20 dark:text-[#FFCC00] border border-amber-500/30 text-[9px] px-1.5 py-0.2 rounded-full font-bold">PRO</span>
              </button>
            )}

            <button
              id="tab-orders-btn"
              onClick={() => setCurrentTab('orders')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                currentTab === 'orders'
                  ? 'bg-[#FFCC00] text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              Tracking
            </button>

            <button
              id="tab-info-btn"
              onClick={() => setCurrentTab('info')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                currentTab === 'info'
                  ? 'bg-[#FFCC00] text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              Workshop
            </button>
          </nav>

          {/* 3. Right Action Bar (Social Links, Admin, Theme & Cart) */}
          <div className="flex items-center space-x-2 md:space-x-3" id="desktop-actions">
            
            {/* Social / WhatsApp quick connect */}
            <div className="hidden lg:flex items-center space-x-2 text-neutral-400 dark:text-neutral-400">
              <a
                href="https://wa.me/6285339499687"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-emerald-400 transition"
                title="Chat WhatsApp Admin"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 hover:text-pink-400 transition"
                title="Instagram Cetak Instan"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>

            {/* Role Switcher (Admin Badge when logged in, or discreet Lock icon) */}
            {role === 'moderator' ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={toggleRole}
                  id="role-toggle-btn"
                  className="flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
                  title="Keluar dari Mode Admin"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </button>

                {onOpenAdminSecurityModal && (
                  <button
                    onClick={onOpenAdminSecurityModal}
                    id="admin-security-settings-btn"
                    className="flex items-center space-x-1 rounded-full bg-slate-100 dark:bg-[#181a20] text-amber-600 dark:text-[#FFCC00] hover:bg-slate-200 dark:hover:bg-[#22262e] border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs font-bold transition"
                    title="Ubah PIN & No WA Admin"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : showAdminLock ? (
              <button
                onClick={onOpenAdminPinModal}
                id="admin-login-lock-btn"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-[#15171d] text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white transition"
                title="Akses Pengelola Toko"
              >
                <Lock className="h-3.5 w-3.5" />
              </button>
            ) : null}

            {/* Dark/Light Mode Switcher */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-[#15171d] text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white transition"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5 text-amber-400 dark:text-[#FFCC00]" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-slate-600" />
              )}
            </button>

            {/* Cart Button with Count Pill */}
            <button
              id="cart-drawer-trigger"
              onClick={openCartDrawer}
              className="relative flex items-center space-x-2 rounded-full bg-slate-100 dark:bg-[#181a20] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white transition shadow-xs"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
              <span className="hidden sm:inline text-slate-700 dark:text-neutral-300">Order</span>
              {cartCount > 0 ? (
                <span 
                  id="cart-badge-count"
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FFCC00] text-slate-950 px-1.5 text-[10px] font-black"
                >
                  {cartCount}
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 dark:text-neutral-500 font-bold">0</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ====== MOBILE FLOATING BOTTOM NAVIGATION ====== */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-4 left-4 right-4 z-50 flex h-15 items-center justify-around rounded-2xl bg-white/95 dark:bg-[#0e1014]/95 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md md:hidden px-2"
      >
        <button
          id="mobile-nav-catalog"
          onClick={() => setCurrentTab('catalog')}
          className={`flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            currentTab === 'catalog' ? 'text-amber-600 dark:text-[#FFCC00] font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Printer className="h-4 w-4 mb-0.5" />
          <span className="text-[9px] tracking-tight">Katalog</span>
        </button>

        <button
          id="mobile-nav-cart"
          onClick={() => setCurrentTab('cart')}
          className={`relative flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            currentTab === 'cart' ? 'text-amber-600 dark:text-[#FFCC00] font-bold' : 'hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="h-4 w-4 mb-0.5" />
          <span className="text-[9px] tracking-tight">Keranjang</span>
          {cartCount > 0 && (
            <span 
              id="mobile-cart-badge"
              className="absolute top-1 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFCC00] text-slate-950 text-[8px] font-black"
            >
              {cartCount}
            </span>
          )}
        </button>

        <button
          id="mobile-nav-orders"
          onClick={() => setCurrentTab('orders')}
          className={`flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            currentTab === 'orders' ? 'text-amber-600 dark:text-[#FFCC00] font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Clock className="h-4 w-4 mb-0.5" />
          <span className="text-[9px] tracking-tight">Status</span>
        </button>

        <button
          id="mobile-nav-info"
          onClick={() => setCurrentTab('info')}
          className={`flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            currentTab === 'info' ? 'text-amber-600 dark:text-[#FFCC00] font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Store className="h-4 w-4 mb-0.5" />
          <span className="text-[9px] tracking-tight">Toko</span>
        </button>

        {/* Small admin toggle */}
        <button
          onClick={role === 'moderator' ? toggleRole : onOpenAdminPinModal}
          id="mobile-role-toggle"
          className={`flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            role === 'moderator' ? 'text-rose-400 font-bold' : 'text-neutral-400'
          }`}
        >
          {role === 'moderator' ? (
            <>
              <Shield className="h-4 w-4 mb-0.5 text-rose-400" />
              <span className="text-[9px] tracking-tight">Admin</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mb-0.5 text-neutral-400" />
              <span className="text-[9px] tracking-tight">Login</span>
            </>
          )}
        </button>
      </nav>
    </>
  );
}
