/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Award, 
  Truck, 
  HelpCircle, 
  Printer, 
  Layers, 
  FileText, 
  CreditCard, 
  Presentation,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldAlert,
  RotateCcw,
  Info,
  X,
  AlertCircle,
  Plus
} from 'lucide-react';
import { CartItem, Product, ProductCategory, StoreHours, OrderRecord, OrderStatus, DesignTemplate } from './types';
import { PRODUCTS, calculatePrintPrice, formatIDR, WHATSAPP_NUMBER_DEFAULT } from './data';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CalculatorModal from './components/CalculatorModal';
import CartView from './components/CartView';
import StoreInfo from './components/StoreInfo';
import AdminProductEditor from './components/AdminProductEditor';
import MaterialCatalogModal from './components/MaterialCatalogModal';
import CreateProductModal from './components/CreateProductModal';
import WhatsAppQRCard from './components/WhatsAppQRCard';
import EditStoreHoursModal from './components/EditStoreHoursModal';
import OrderTracker from './components/OrderTracker';
import DesignTemplatesModal from './components/DesignTemplatesModal';
import AdminPinModal from './components/AdminPinModal';
import AdminSecuritySettingsModal from './components/AdminSecuritySettingsModal';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // 1. Core States
  const [currentTab, setCurrentTab] = useState<'catalog' | 'cart' | 'info' | 'orders'>('catalog');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cetakinstan_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [pickedTemplate, setPickedTemplate] = useState<{ tpl: DesignTemplate; prod: Product } | null>(null);

  // Orders State & LocalStorage
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('cetakinstan_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'INV-20260819-001',
        customerName: 'Budi Santoso',
        whatsapp: '085339499687',
        deliveryMethod: 'pickup',
        address: '',
        items: [
          {
            id: 'sample-1',
            productId: 'spanduk-flexi-outdoor',
            productName: 'Spanduk / Banner Outdoor',
            category: 'banner',
            pricingType: 'area',
            unit: 'm²',
            material: { id: 'flexi-280', name: 'Flexi China 280gr', extraPrice: 0 },
            width: 3,
            length: 1,
            finishing: [{ id: 'mata-ayam', name: 'Mata Ayam (Slongsong)', price: 0, isPerUnit: false }],
            quantity: 2,
            designUrl: 'https://drive.google.com/sample',
            notes: 'Cetak tajam warna cerah',
            subtotal: 120000
          }
        ],
        totalAmount: 120000,
        status: 'printing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  });

  // 1.1. New Customization & Role States
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cetakinstan_theme') as 'light' | 'dark') || 'light';
  });
  
  const [role, setRole] = useState<'buyer' | 'moderator'>(() => {
    return (localStorage.getItem('cetakinstan_role') as 'buyer' | 'moderator') || 'buyer';
  });

  const [productsDb, setProductsDb] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cetakinstan_products_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        // Auto-merge any missing default PRODUCTS (e.g. cetak-buku-custom)
        const missing = PRODUCTS.filter((p) => !parsed.some((savedP) => savedP.id === p.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      } catch (e) {
        return PRODUCTS;
      }
    }
    return PRODUCTS;
  });

  const [activeAdminEditProduct, setActiveAdminEditProduct] = useState<Product | null>(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState<boolean>(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState<boolean>(false);
  const [isAdminSecurityModalOpen, setIsAdminSecurityModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auto open Admin PIN modal if URL hash is #admin
  useEffect(() => {
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      setIsAdminPinModalOpen(true);
    }
  }, []);

  // 1.2. Store Hours State
  const [storeHours, setStoreHours] = useState<StoreHours>(() => {
    const saved = localStorage.getItem('cetakinstan_store_hours');
    if (saved) {
      try {
        return JSON.parse(saved) as StoreHours;
      } catch (e) {
        // fallback
      }
    }
    return {
      openDays: 'Senin - Sabtu',
      openTime: '08:00',
      closeTime: '20:00',
      closedDaysInfo: 'Minggu & Hari Libur Tutup',
      timezone: 'WIB'
    };
  });
  const [isEditStoreHoursModalOpen, setIsEditStoreHoursModalOpen] = useState<boolean>(false);

  // 2. Persist States to Local Storage
  useEffect(() => {
    localStorage.setItem('cetakinstan_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('cetakinstan_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('cetakinstan_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('cetakinstan_products_db', JSON.stringify(productsDb));
  }, [productsDb]);

  useEffect(() => {
    localStorage.setItem('cetakinstan_store_hours', JSON.stringify(storeHours));
  }, [storeHours]);

  useEffect(() => {
    localStorage.setItem('cetakinstan_orders', JSON.stringify(orders));
  }, [orders]);

  const handleSaveOrderRecord = (newOrder: OrderRecord) => {
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Pesanan ${newOrder.id} berhasil dicatat & masuk antrean!`, 'success');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o));
    showToast(`Status pesanan ${orderId} diperbarui ke ${newStatus.toUpperCase()}!`, 'info');
  };

  const handleSaveStoreHours = (updated: StoreHours) => {
    setStoreHours(updated);
    showToast('Jam operasional toko berhasil diperbarui!', 'success');
  };

  // Toast Notification triggers
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}`;
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleSaveAdminProduct = (updatedProduct: Product) => {
    const updatedList = productsDb.map((p) => p.id === updatedProduct.id ? updatedProduct : p);
    setProductsDb(updatedList);
    showToast(`Data & harga database untuk ${updatedProduct.name} berhasil diperbarui!`, 'success');
  };

  const handleCreateProduct = (newProduct: Product) => {
    setProductsDb((prev) => [...prev, newProduct]);
    setIsCreateProductModalOpen(false);
    showToast(`Menu jasa baru "${newProduct.name}" berhasil diterbitkan!`, 'success');
  };

  const handleDeleteProduct = (productId: string) => {
    const target = productsDb.find((p) => p.id === productId);
    const prodName = target ? target.name : 'Jasa cetak';
    setProductsDb((prev) => prev.filter((p) => p.id !== productId));
    if (activeAdminEditProduct?.id === productId) {
      setActiveAdminEditProduct(null);
    }
    showToast(`Katalog jasa "${prodName}" berhasil dihapus dari database!`, 'info');
  };

  const handleSaveMaterials = (productId: string, updatedMaterials: any[]) => {
    const targetProduct = productsDb.find(p => p.id === productId);
    if (targetProduct) {
      const updatedProduct = {
        ...targetProduct,
        materials: updatedMaterials
      };
      const updatedList = productsDb.map((p) => p.id === productId ? updatedProduct : p);
      setProductsDb(updatedList);
      showToast('Katalog bahan berhasil diperbarui!', 'success');
    }
  };

  const handleResetPrices = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh database harga ke standar pabrik?')) {
      setProductsDb(PRODUCTS);
      showToast('Seluruh harga database produk telah dikembalikan ke standar.', 'info');
    }
  };

  // 3. Filtered Products
  const filteredProducts = productsDb.filter((p) => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Categories list with Icons for Filter
  const categories: { id: ProductCategory; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'all', label: 'Semua Jasa', icon: Sparkles },
    { id: 'banner', label: 'Banner / Spanduk', icon: Printer },
    { id: 'stiker', label: 'Stiker Label', icon: Layers },
    { id: 'brosur', label: 'Brosur & Flyer', icon: FileText },
    { id: 'kartu_nama', label: 'Kartu Nama', icon: CreditCard },
    { id: 'display', label: 'Display & Stand', icon: Presentation },
  ];

  // 4. Cart Handlers
  const handleAddToCart = (newItem: CartItem) => {
    // Cari apakah item dengan spek yang sama persis sudah ada di keranjang
    const existingIndex = cart.findIndex((item) => {
      if (item.productId !== newItem.productId) return false;
      if (item.material.id !== newItem.material.id) return false;
      if (item.width !== newItem.width || item.length !== newItem.length) return false;
      if (item.pages !== newItem.pages) return false;
      
      const itemFinIds = item.finishing.map((f) => f.id).sort().join(',');
      const newFinIds = newItem.finishing.map((f) => f.id).sort().join(',');
      if (itemFinIds !== newFinIds) return false;
      
      if (item.designUrl !== newItem.designUrl) return false;
      return true;
    });

    if (existingIndex > -1) {
      // Jika sama persis, gabungkan kuantitas dan hitung ulang harga
      const updatedCart = [...cart];
      const existingItem = updatedCart[existingIndex];
      const combinedQty = existingItem.quantity + newItem.quantity;
      
      // Ambil referensi produk asli untuk hitung ulang harga gabungan
      const productObj = productsDb.find((p) => p.id === existingItem.productId);
      if (productObj) {
        const recalculated = calculatePrintPrice({
          product: productObj,
          material: existingItem.material,
          width: existingItem.width,
          length: existingItem.length,
          pages: existingItem.pages,
          finishing: existingItem.finishing,
          quantity: combinedQty
        });

        existingItem.quantity = combinedQty;
        existingItem.subtotal = recalculated.total;
      } else {
        existingItem.quantity = combinedQty;
        existingItem.subtotal = existingItem.subtotal + newItem.subtotal;
      }
      setCart(updatedCart);
    } else {
      // Jika baru, langsung masukkan ke list
      setCart([...cart, newItem]);
    }

    showToast('Berhasil menambahkan item ke keranjang belanja!', 'success');

    // Auto-open drawer di desktop untuk memberikan feedback instan yang menyenangkan
    if (window.innerWidth >= 768) {
      setIsCartDrawerOpen(true);
    } else {
      // Di mobile, ganti tab ke keranjang agar user langsung melihat itemnya
      setCurrentTab('cart');
    }
  };

  const handleUpdateQty = (itemId: string, newQty: number) => {
    const updatedCart = cart.map((item) => {
      if (item.id !== itemId) return item;

      const productObj = productsDb.find((p) => p.id === item.productId);
      if (!productObj) return item;

      // Kuantitas tidak boleh kurang dari minQty produk
      const validQty = Math.max(productObj.minQty, newQty);
      
      const recalculated = calculatePrintPrice({
        product: productObj,
        material: item.material,
        width: item.width,
        length: item.length,
        pages: item.pages,
        finishing: item.finishing,
        quantity: validQty
      });

      return {
        ...item,
        quantity: validQty,
        subtotal: recalculated.total
      };
    });

    setCart(updatedCart);
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
    showToast('Item berhasil dihapus dari keranjang.', 'info');
  };

  const handleClearCart = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh isi keranjang?')) {
      setCart([]);
      showToast('Seluruh item di keranjang belanja telah dikosongkan.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200" id="app-root">
      
      {/* 1. Header & Navigation (Adaptif) */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        openCartDrawer={() => setIsCartDrawerOpen(true)}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        role={role}
        toggleRole={() => {
          if (role === 'moderator') {
            setRole('buyer');
            showToast('Anda telah keluar dari Mode Admin (Kembali ke Mode Pembeli).', 'info');
          } else {
            setIsAdminPinModalOpen(true);
          }
        }}
        onOpenAdminPinModal={() => setIsAdminPinModalOpen(true)}
        onOpenAdminSecurityModal={() => setIsAdminSecurityModalOpen(true)}
        showAdminLock={role === 'moderator' || window.location.search.includes('admin=true') || window.location.hash === '#admin' || true}
        storeHours={storeHours}
        onOpenEditStoreHours={() => setIsEditStoreHoursModalOpen(true)}
        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12" id="main-content-layout">
        
        {/* TAB CATALOG */}
        {currentTab === 'catalog' && (
          <div className="animate-fade-in" id="catalog-tab-view">
            
            {/* ====== BANNER HERO / PROMO PERCETAKAN ====== */}
            <section className="relative overflow-hidden bg-slate-900 text-white py-12 px-4 md:py-16 md:px-6" id="hero-banner">
              {/* Decorative abstract circle background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl -z-10"></div>
              
              <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7 space-y-4 text-center md:text-left" id="hero-text-container">
                  <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Layanan Cetak Kilat Terpercaya</span>
                  </span>
                  
                  <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl leading-tight">
                    Cetak Cepat, Hasil Presisi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Harga Transparan!</span>
                  </h2>
                  
                  <p className="text-xs md:text-sm text-slate-300 max-w-lg leading-relaxed">
                    Hitung biaya custom cetak secara instan dengan kalkulator real-time kami. File siap cetak akan ditinjau tim professional sebelum diproduksi. Kirim draf pemesanan rapi langsung ke WhatsApp admin!
                  </p>

                  {/* Highlights Bar */}
                  <div className="grid grid-cols-3 gap-3 pt-3 text-left max-w-md mx-auto md:mx-0" id="hero-highlights">
                    <div className="flex items-center space-x-1.5">
                      <Award className="h-4 w-4 text-amber-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-200">Hi-Res Quality</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Truck className="h-4 w-4 text-cyan-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-200">Kirim Kurir</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-200">Free File Check</span>
                    </div>
                  </div>
                </div>

                {/* Info Card QR Code WhatsApp (Pengganti Promo) */}
                <div className="md:col-span-5" id="hero-qr-whatsapp-card">
                  <WhatsAppQRCard role={role} />
                </div>
              </div>
            </section>

            {/* ====== SEARCH & CATEGORY FILTER ====== */}
            <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 space-y-6 scroll-mt-20" id="catalog-search-filter">
              
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Katalog Layanan Cetak</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pilih salah satu layanan cetakan di bawah untuk menghitung biaya custom</p>
                  
                  {role === 'moderator' && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-[11px] font-bold text-red-600 dark:text-red-400 animate-fade-in" id="moderator-warning-label">
                      <div className="flex items-center space-x-1">
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        <span>Mode Admin Aktif - Klik "Edit Harga" untuk menyesuaikan biaya.</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleResetPrices}
                          className="underline hover:text-red-800 dark:hover:text-red-300 flex items-center space-x-1"
                          title="Kembalikan semua harga produk ke standard bawaan"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset Database</span>
                        </button>

                        <button 
                          onClick={() => setIsCreateProductModalOpen(true)}
                          className="rounded bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 flex items-center space-x-1 shadow-sm transition"
                          title="Tambah jenis jasa cetak baru kustom ke dalam katalog"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Tambah Jasa Baru</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative w-full md:max-w-xs flex items-center">
                  <Search className="absolute left-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari layanan cetakan..."
                    id="search-input-catalog"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2 pl-9 pr-4 text-xs text-slate-850 dark:text-slate-100 focus:border-amber-500 focus:outline-hidden placeholder:text-slate-400 shadow-3xs"
                  />
                </div>
              </div>

              {/* Categories horizontal pill lists */}
              <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2" id="category-pills">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`cat-pill-${cat.id}`}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center space-x-1.5 rounded-full border px-4 py-2 text-xs font-bold transition shrink-0 ${
                        isActive
                          ? 'border-slate-900 bg-slate-900 dark:border-slate-800 dark:bg-slate-800 text-white shadow-md'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ====== PRODUCTS GRID (1 to 4 cols) ====== */}
              {filteredProducts.length > 0 ? (
                <div 
                  id="products-catalog-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
                >
                  {filteredProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={(prod) => setSelectedProduct(prod)}
                      role={role}
                      onAdminEdit={(prod) => setActiveAdminEditProduct(prod)}
                      onViewMaterials={(prod) => setSelectedCatalogProduct(prod)}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50" id="no-search-results">
                  <p className="text-sm font-bold text-slate-850 dark:text-slate-200">Layanan cetakan tidak ditemukan</p>
                  <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Coba gunakan kata kunci pencarian lain atau pilih kategori Semua Jasa.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="mt-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB CART (Mobile Full View) */}
        {currentTab === 'cart' && (
          <div className="animate-fade-in" id="cart-tab-view">
            <CartView
              cart={cart}
              onUpdateQty={handleUpdateQty}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onSaveOrderRecord={handleSaveOrderRecord}
              isDrawer={false}
            />
          </div>
        )}

        {/* TAB ORDERS (Cek Status Pesanan) */}
        {currentTab === 'orders' && (
          <div className="animate-fade-in" id="orders-tab-view">
            <OrderTracker
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              role={role}
            />
          </div>
        )}

        {/* TAB INFO */}
        {currentTab === 'info' && (
          <div className="animate-fade-in" id="info-tab-view">
            <StoreInfo
              storeHours={storeHours}
              role={role}
              onOpenEditStoreHours={() => setIsEditStoreHoursModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-10 px-4 border-t border-slate-850 text-center" id="main-footer">
        <div className="mx-auto max-w-7xl space-y-4" id="footer-content">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="text-left" id="footer-branding">
              <h3 className="text-sm font-extrabold text-white">CetakInstan Digital Print</h3>
              <p className="text-[11px] text-slate-500">Platform Pemesanan & Kalkulator Jasa Percetakan Otomatis</p>
            </div>
            
            {/* Quick Contact Footer */}
            <div className="flex items-center space-x-3 text-[11px]" id="footer-quick-contact">
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER_DEFAULT}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center space-x-1.5 text-emerald-400 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>WhatsApp Admin (+{WHATSAPP_NUMBER_DEFAULT})</span>
              </a>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 leading-normal" id="footer-dev-note">
            Aplikasi ini dirancang menggunakan sistem responsive layout modern. Sebagai admin/moderator, Anda dapat menggunakan tombol di bagian atas navigasi untuk menyesuaikan katalog harga secara instan.
          </p>

          <p className="text-[10px] text-slate-600" id="footer-copyright">
            &copy; {new Date().getFullYear()} CetakInstan Hub. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ====== DIALOGS & MODALS ====== */}

      {/* Modal Kalkulator Jasa Cetak */}
      {selectedProduct && (
        <CalculatorModal
          product={selectedProduct}
          initialTemplateName={pickedTemplate?.tpl.title}
          initialTemplateUrl={pickedTemplate?.tpl.imageUrl}
          onClose={() => {
            setSelectedProduct(null);
            setPickedTemplate(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Modal Galeri Templat Desain Gratis */}
      {isTemplatesModalOpen && (
        <DesignTemplatesModal
          products={productsDb}
          role={role}
          onClose={() => setIsTemplatesModalOpen(false)}
          onSelectTemplate={(tpl, matchedProd) => {
            setPickedTemplate({ tpl, prod: matchedProd });
            setSelectedProduct(matchedProd);
            showToast(`Templat "${tpl.title}" dipilih untuk produk ${matchedProd.name}`, 'info');
          }}
        />
      )}

      {/* Desktop Side Drawer Keranjang */}
      {isCartDrawerOpen && (
        <CartView
          cart={cart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onSaveOrderRecord={handleSaveOrderRecord}
          isDrawer={true}
          onCloseDrawer={() => setIsCartDrawerOpen(false)}
        />
      )}

      {/* Modal Admin Edit Jam Operasional Toko */}
      {isEditStoreHoursModalOpen && (
        <EditStoreHoursModal
          storeHours={storeHours}
          onSave={handleSaveStoreHours}
          onClose={() => setIsEditStoreHoursModalOpen(false)}
        />
      )}
      {activeAdminEditProduct && (
        <AdminProductEditor
          product={activeAdminEditProduct}
          onClose={() => setActiveAdminEditProduct(null)}
          onSave={handleSaveAdminProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {/* Modal Katalog Galeri Bahan */}
      {selectedCatalogProduct && (
        <MaterialCatalogModal
          product={selectedCatalogProduct}
          role={role}
          onClose={() => setSelectedCatalogProduct(null)}
          onSaveMaterials={handleSaveMaterials}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />
      )}

      {/* Modal Membuat Jasa Baru */}
      {isCreateProductModalOpen && (
        <CreateProductModal
          onClose={() => setIsCreateProductModalOpen(false)}
          onSave={handleCreateProduct}
        />
      )}

      {/* Modal PIN Admin */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
        onSuccess={() => {
          setRole('moderator');
          showToast('Login Admin Berhasil! Selamat datang di Mode Moderator (Penjual).', 'success');
        }}
      />

      {/* Modal Pengaturan Keamanan Admin (Ubah PIN) */}
      <AdminSecuritySettingsModal
        isOpen={isAdminSecurityModalOpen}
        onClose={() => setIsAdminSecurityModalOpen(false)}
        onSaveToast={(msg, type) => showToast(msg, type)}
      />

      {/* ====== FLOATING TOAST NOTIFICATIONS ====== */}
      <div id="toast-notifications-container" className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-xs font-bold pointer-events-auto animate-slide-left ${
              toast.type === 'success'
                ? 'bg-slate-900/95 dark:bg-slate-900/95 border-emerald-500/30 text-emerald-500 dark:text-emerald-400'
                : toast.type === 'error'
                ? 'bg-red-950/95 border-red-500/30 text-red-500'
                : 'bg-slate-900/95 dark:bg-slate-900/95 border-amber-500/30 text-amber-500 dark:text-amber-400'
            }`}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              ) : (
                <Info className="h-4 w-4 text-amber-500 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-4 text-slate-400 hover:text-white pointer-events-auto"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
