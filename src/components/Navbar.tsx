/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Printer, ShoppingBag, Phone, Clock, Store, Sun, Moon, Shield, Eye, Edit3, Sparkles, Search, Lock, KeyRound } from 'lucide-react';
import { ProductCategory, StoreHours } from '../types';

interface NavbarProps {
  currentTab: 'catalog' | 'cart' | 'info' | 'orders';
  setCurrentTab: (tab: 'catalog' | 'cart' | 'info' | 'orders') => void;
  cartCount: number;
  openCartDrawer: () => void;
  categories: { id: ProductCategory; label: string }[];
  activeCategory: ProductCategory;
  setActiveCategory: (category: ProductCategory) => void;
  onOpenTemplatesModal?: () => void;
  
  // New props for Theme and Role switching
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  role: 'buyer' | 'moderator';
  toggleRole: () => void;
  onOpenAdminPinModal?: () => void;
  onOpenAdminSecurityModal?: () => void;

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
      {/* ====== DESKTOP & TABLET TOP HEADER ====== */}
      <header 
        className="sticky top-0 z-40 w-full border-b transition-colors duration-200 border-slate-200 bg-slate-900 text-white shadow-md dark:border-slate-800"
        id="desktop-header"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          
          {/* Logo */}
          <button 
            onClick={() => { setCurrentTab('catalog'); setActiveCategory('all'); }} 
            className="flex items-center space-x-2 transition hover:opacity-90 text-left"
            id="nav-logo-btn"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 shadow-lg" id="logo-badge">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white md:text-xl">
                Cetak<span className="text-amber-400">Instan</span>
              </h1>
              <p className="text-[10px] text-slate-300 font-medium tracking-wide">DIGITAL & OFFSET PRINTING</p>
            </div>
          </button>

          {/* Kontak & Jam Buka (Desktop Only) */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-300" id="desktop-store-info">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <div>
                <div className="flex items-center space-x-1">
                  <p className="font-semibold text-white">{displayHours.openDays}: {displayHours.openTime} - {displayHours.closeTime}</p>
                  {role === 'moderator' && onOpenEditStoreHours && (
                    <button
                      onClick={onOpenEditStoreHours}
                      className="ml-1 text-[9px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 transition flex items-center space-x-0.5"
                      title="Atur Jam Operasional Toko"
                    >
                      <Edit3 className="h-2.5 w-2.5" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                <p className="text-slate-400 text-[10px]">{displayHours.closedDaysInfo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">WA Fast Response</p>
                <p className="text-slate-400 text-[10px]">0853-3949-9687</p>
              </div>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-2 md:space-x-3.5" id="desktop-actions">
            
            {/* Role Switcher (Admin Badge when logged in, or discreet Lock icon for Admin PIN) */}
            {role === 'moderator' ? (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={toggleRole}
                  id="role-toggle-btn"
                  className="flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-xs"
                  title="Keluar dari Mode Admin"
                >
                  <Shield className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                  <span>Mode Admin (Keluar)</span>
                </button>

                {onOpenAdminSecurityModal && (
                  <button
                    onClick={onOpenAdminSecurityModal}
                    id="admin-security-settings-btn"
                    className="flex items-center space-x-1 rounded-full bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 text-xs font-bold transition"
                    title="Ubah PIN & No WA Admin"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Ubah PIN</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAdminPinModal}
                id="admin-login-lock-btn"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-amber-400 transition"
                title="Akses Pengelola Toko"
              >
                <Lock className="h-4 w-4" />
              </button>
            )}

            {/* Dark/Light Mode Switcher */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-amber-400 transition"
              title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-300" />
              )}
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1" id="desktop-nav-menu">
              <button
                id="tab-catalog-btn"
                onClick={() => setCurrentTab('catalog')}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  currentTab === 'catalog'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Katalog Jasa
              </button>
              {onOpenTemplatesModal && (
                <button
                  id="tab-templates-btn"
                  onClick={onOpenTemplatesModal}
                  className="px-3 py-2 rounded-md text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all duration-200 flex items-center space-x-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Templat Gratis</span>
                </button>
              )}
              <button
                id="tab-orders-btn"
                onClick={() => setCurrentTab('orders')}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  currentTab === 'orders'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Cek Status Pesanan
              </button>
              <button
                id="tab-info-btn"
                onClick={() => setCurrentTab('info')}
                className={`px-3 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
                  currentTab === 'info'
                    ? 'bg-amber-500 text-slate-950 font-extrabold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Informasi Toko
              </button>
            </nav>

            {/* Keranjang Belanja Button */}
            <button
              id="cart-drawer-trigger"
              onClick={openCartDrawer}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 hover:text-amber-400 transition"
              aria-label="Keranjang Belanja"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span 
                  id="cart-badge-count"
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white ring-2 ring-slate-900 animate-pulse"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ====== MOBILE FLOATING BOTTOM NAVIGATION ====== */}
      {/* Only visible on mobile/tablet (below md viewport) */}
      <nav 
        id="mobile-bottom-nav"
        className="fixed bottom-4 left-4 right-4 z-50 flex h-16 items-center justify-around rounded-2xl bg-slate-900/95 text-slate-400 border border-slate-800 shadow-2xl backdrop-blur-md md:hidden px-2"
      >
        <button
          id="mobile-nav-catalog"
          onClick={() => setCurrentTab('catalog')}
          className={`flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            currentTab === 'catalog' ? 'text-amber-400 font-semibold' : 'hover:text-white'
          }`}
        >
          <Printer className={`h-4 w-4 mb-0.5 ${currentTab === 'catalog' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[9px] tracking-tight">Katalog</span>
        </button>

        <button
          id="mobile-nav-cart"
          onClick={() => setCurrentTab('cart')}
          className={`relative flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            currentTab === 'cart' ? 'text-amber-400 font-semibold' : 'hover:text-white'
          }`}
        >
          <ShoppingBag className={`h-4 w-4 mb-0.5 ${currentTab === 'cart' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[9px] tracking-tight">Keranjang</span>
          {cartCount > 0 && (
            <span 
              id="mobile-cart-badge"
              className="absolute top-1 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white ring-1 ring-slate-900"
            >
              {cartCount}
            </span>
          )}
        </button>

        <button
          id="mobile-nav-info"
          onClick={() => setCurrentTab('info')}
          className={`flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            currentTab === 'info' ? 'text-amber-400 font-semibold' : 'hover:text-white'
          }`}
        >
          <Store className={`h-4 w-4 mb-0.5 ${currentTab === 'info' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[9px] tracking-tight">Toko</span>
        </button>

        {/* Small theme switch in mobile bottom bar */}
        <button
          onClick={toggleTheme}
          id="mobile-theme-toggle"
          className="flex flex-col items-center justify-center w-14 h-full text-slate-400 hover:text-white transition"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 mb-0.5 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 mb-0.5 text-slate-400" />
          )}
          <span className="text-[9px] tracking-tight">{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
        </button>

        {/* Small role toggle in mobile bottom bar */}
        <button
          onClick={role === 'moderator' ? toggleRole : onOpenAdminPinModal}
          id="mobile-role-toggle"
          className={`flex flex-col items-center justify-center w-14 h-full rounded-xl transition ${
            role === 'moderator' ? 'text-rose-400 font-bold' : 'text-slate-400'
          }`}
        >
          {role === 'moderator' ? (
            <>
              <Shield className="h-4 w-4 mb-0.5 text-amber-300" />
              <span className="text-[9px] tracking-tight">Keluar Admin</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mb-0.5 text-slate-400" />
              <span className="text-[9px] tracking-tight">Admin</span>
            </>
          )}
        </button>
      </nav>
    </>
  );
}
