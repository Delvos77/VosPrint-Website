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
  Plus,
  FileDown
} from 'lucide-react';
import { CartItem, Product, ProductCategory, StoreHours, OrderRecord, OrderStatus, DesignTemplate } from './types';
import { PRODUCTS, calculatePrintPrice, formatIDR, WHATSAPP_NUMBER_DEFAULT } from './data';
import { generateCatalogPDF } from './utils/pdfGenerator';
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
import VosPrintLogo from './components/VosPrintLogo';
import { verifyAdminSession, logoutAdmin } from './utils/adminAuth';
import {
  fetchCentralStoreData,
  syncProductsToServer,
  syncSingleProductToServer,
  deleteProductFromServer,
  syncStoreHoursToServer,
  submitOrderToServer,
  updateOrderStatusOnServer,
  resetCatalogOnServer
} from './utils/storeApi';

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
  
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    return localStorage.getItem('cetakinstan_search_query') || '';
  });
  const [activeCategory, setActiveCategory] = useState<ProductCategory>(() => {
    return (localStorage.getItem('cetakinstan_active_category') as ProductCategory) || 'all';
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState<boolean>(false);
  const [pickedTemplate, setPickedTemplate] = useState<{ tpl: DesignTemplate; prod: Product } | null>(null);

  // Initial Default Orders
  const DEFAULT_INITIAL_ORDERS: OrderRecord[] = [
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
          finishing: [{ id: 'mata-ayam', name: 'Mata Ayam (Slongsong)', price: 0, isPerUnit: false, description: 'Ring lubang pengikat' }],
          quantity: 2,
          designUrl: 'https://drive.google.com/sample',
          notes: 'Cetak tajam warna cerah',
          subtotal: 120000
        }
      ],
      totalAmount: 120000,
      status: 'checking_file',
      createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Orders State & LocalStorage
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('cetakinstan_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { /* fallback */ }
    }
    return DEFAULT_INITIAL_ORDERS;
  });

  // 1.1. New Customization & Role States
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('cetakinstan_theme') as 'light' | 'dark') || 'dark';
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

  // Auto verify Admin Session and Hydrate Data from Centralized Server
  useEffect(() => {
    // Purge legacy plaintext PIN from client localStorage for complete security
    localStorage.removeItem('cetakinstan_admin_pin');

    if (role === 'moderator') {
      verifyAdminSession().then((isValid) => {
        if (!isValid) {
          setRole('buyer');
        }
      });
    }

    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      setIsAdminPinModalOpen(true);
    }

    // 1. Initial hydration from Centralized Server Data
    const loadServerData = async () => {
      const serverData = await fetchCentralStoreData();
      if (serverData) {
        if (Array.isArray(serverData.products) && serverData.products.length > 0) {
          setProductsDb(serverData.products);
          localStorage.setItem('cetakinstan_products_db', JSON.stringify(serverData.products));
        }
        if (serverData.storeHours) {
          setStoreHours(serverData.storeHours);
          localStorage.setItem('cetakinstan_store_hours', JSON.stringify(serverData.storeHours));
        }
        if (Array.isArray(serverData.orders) && serverData.orders.length > 0) {
          setOrders(serverData.orders);
          localStorage.setItem('cetakinstan_orders', JSON.stringify(serverData.orders));
        }
      }
    };

    loadServerData();

    // 2. Periodic background live-sync (every 12 seconds) so any device/visitor sees updates live
    const interval = setInterval(async () => {
      const serverData = await fetchCentralStoreData();
      if (serverData) {
        if (Array.isArray(serverData.products) && serverData.products.length > 0) {
          setProductsDb(serverData.products);
        }
        if (serverData.storeHours) {
          setStoreHours(serverData.storeHours);
        }
        if (Array.isArray(serverData.orders) && serverData.orders.length > 0) {
          setOrders(serverData.orders);
        }
      }
    }, 12000);

    return () => clearInterval(interval);
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

  useEffect(() => {
    localStorage.setItem('cetakinstan_search_query', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('cetakinstan_active_category', activeCategory);
  }, [activeCategory]);

  // Real-time synchronization across browser tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cetakinstan_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setOrders(parsed);
        } catch (err) {}
      }
      if (e.key === 'cetakinstan_products_db' && e.newValue) {
        try {
          setProductsDb(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === 'cetakinstan_store_hours' && e.newValue) {
        try {
          setStoreHours(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    const handleCustomOrderUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<OrderRecord[]>;
      if (customEvent.detail) {
        setOrders(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cetakinstan_orders_updated', handleCustomOrderUpdate);

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('cetakinstan_realtime_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data.orders)) {
            setOrders(event.data.orders);
          }
        };
      }
    } catch (err) {}

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cetakinstan_orders_updated', handleCustomOrderUpdate);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  const handleSaveOrderRecord = (newOrder: OrderRecord) => {
    setOrders((prev) => {
      const nextOrders = [newOrder, ...prev];
      try {
        localStorage.setItem('cetakinstan_orders', JSON.stringify(nextOrders));
      } catch (e) {}

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('cetakinstan_realtime_channel');
          bc.postMessage({ type: 'ORDERS_UPDATED', orders: nextOrders });
          bc.close();
        }
      } catch (e) {}

      return nextOrders;
    });

    // Save to centralized server
    submitOrderToServer(newOrder);

    showToast(`Pesanan #${newOrder.id} berhasil dicatat & masuk antrean server!`, 'success');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updatedAt = new Date().toISOString();

    setOrders((prev) => {
      const nextOrders = prev.map((o) => o.id === orderId ? { ...o, status: newStatus, updatedAt } : o);
      try {
        localStorage.setItem('cetakinstan_orders', JSON.stringify(nextOrders));
      } catch (e) {}

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('cetakinstan_realtime_channel');
          bc.postMessage({ type: 'ORDERS_UPDATED', orders: nextOrders });
          bc.close();
        }
      } catch (e) {}

      return nextOrders;
    });

    // Update status in centralized server
    updateOrderStatusOnServer(orderId, newStatus);

    const statusLabels: Record<OrderStatus, string> = {
      pending: 'Menunggu Konfirmasi',
      checking_file: 'Pengecekan File',
      printing: 'Proses Cetak Mesin',
      finishing: 'Finishing & Pemotongan',
      ready: 'Siap Diambil / Dikirim',
      completed: 'Selesai'
    };
    const labelName = statusLabels[newStatus] || newStatus;
    showToast(`Status pesanan #${orderId} berhasil diubah ke: ${labelName}`, 'success');
  };

  const handleSaveStoreHours = (updated: StoreHours) => {
    setStoreHours(updated);
    // Sync store hours to centralized server
    syncStoreHoursToServer(updated);
    showToast('Jam operasional toko berhasil diperbarui & disimpan di server!', 'success');
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
    // Sync to centralized server
    syncSingleProductToServer(updatedProduct);
    syncProductsToServer(updatedList);
    showToast(`Data & harga server untuk "${updatedProduct.name}" berhasil diperbarui!`, 'success');
  };

  const handleCreateProduct = (newProduct: Product) => {
    const nextList = [...productsDb, newProduct];
    setProductsDb(nextList);
    setIsCreateProductModalOpen(false);
    // Sync new product to server
    syncSingleProductToServer(newProduct);
    syncProductsToServer(nextList);
    showToast(`Menu jasa baru "${newProduct.name}" berhasil diterbitkan ke server!`, 'success');
  };

  const handleDeleteProduct = (productId: string) => {
    const target = productsDb.find((p) => p.id === productId);
    const prodName = target ? target.name : 'Jasa cetak';
    const nextList = productsDb.filter((p) => p.id !== productId);
    setProductsDb(nextList);
    if (activeAdminEditProduct?.id === productId) {
      setActiveAdminEditProduct(null);
    }
    // Delete on centralized server
    deleteProductFromServer(productId);
    showToast(`Katalog jasa "${prodName}" berhasil dihapus dari server!`, 'info');
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
      syncSingleProductToServer(updatedProduct);
      syncProductsToServer(updatedList);
      showToast('Katalog bahan berhasil diperbarui di server!', 'success');
    }
  };

  const handleResetPrices = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan seluruh database harga ke standar pabrik di server?')) {
      setProductsDb(PRODUCTS);
      resetCatalogOnServer();
      showToast('Seluruh harga database produk telah di-reset ke standar di server.', 'info');
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
    setCart([]);
    showToast('Seluruh item di keranjang belanja telah dikosongkan.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#090a0d] text-slate-800 dark:text-white flex flex-col font-sans transition-colors duration-500 ease-in-out" id="app-root">
      
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
            logoutAdmin();
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
      <main className="flex-1 pb-24 md:pb-16" id="main-content-layout">
        
        {/* TAB CATALOG */}
        {currentTab === 'catalog' && (
          <div className="animate-fade-in" id="catalog-tab-view">
            
            {/* ====== BANNER HERO / POWERHOUSE STUDIO (Comfort & Elegant) ====== */}
            <section className="relative overflow-hidden pt-12 pb-16 px-4 md:pt-20 md:pb-24 text-center border-b border-slate-200 dark:border-white/5" id="hero-banner">
              {/* Glow Ambient */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-[#FFCC00]/15 dark:from-[#FFCC00]/10 via-[#FFCC00]/5 to-transparent blur-3xl -z-10 pointer-events-none" />
              
              {/* Stylized background watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] sm:text-[200px] md:text-[280px] font-black text-black/[0.02] dark:text-white/[0.02] tracking-widest select-none pointer-events-none -z-10 uppercase">
                CETAK
              </div>

              <div className="mx-auto max-w-4xl space-y-6">
                <div className="inline-flex items-center space-x-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-neutral-300 backdrop-blur-md shadow-xs">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  <span>Workshop Online & Produksi Cepat</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
                  Percetakan Powerhouse.<br />
                  <span className="text-amber-600 dark:text-[#FFCC00] font-light">Kualitas Presisi & Kilat.</span>
                </h1>
                
                <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
                  Hitung biaya custom cetak secara instan dengan kalkulator real-time kami. File siap cetak akan ditinjau tim professional sebelum diproduksi. Kirim draf pemesanan rapi langsung ke WhatsApp admin!
                </p>

                {/* Highlights Bar */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2" id="hero-highlights">
                  <div className="flex items-center space-x-1.5 rounded-full bg-white dark:bg-[#14161b] border border-slate-200 dark:border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>Akurasi Warna CMYK</span>
                  </div>
                  <div className="flex items-center space-x-1.5 rounded-full bg-white dark:bg-[#14161b] border border-slate-200 dark:border-white/10 px-3.5 py-1.5 text-xs font-medium text-amber-600 dark:text-[#FFCC00] shadow-sm">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span>Layanan Fast-Track 1 Hari</span>
                  </div>
                  <div className="flex items-center space-x-1.5 rounded-full bg-white dark:bg-[#14161b] border border-slate-200 dark:border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-neutral-300 shadow-sm">
                    <Truck className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                    <span>Kirim Instan & Ekspedisi</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ====== SEARCH & CATEGORY FILTER ====== */}
            <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 space-y-8 scroll-mt-20" id="catalog-search-filter">
              
              {/* Header Title Bar & Search */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      Katalog Layanan Cetak
                    </h2>
                    <span className="rounded-full bg-slate-200 dark:bg-white/10 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-neutral-300">
                      {filteredProducts.length} Jasa
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400">Pilih salah satu layanan cetakan di bawah untuk menghitung biaya custom</p>
                  
                  {role === 'moderator' && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2 text-xs font-bold text-red-400 animate-fade-in" id="moderator-warning-label">
                      <div className="flex items-center space-x-1.5">
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                        <span>Mode Admin Aktif - Klik "Edit Harga" untuk menyesuaikan biaya.</span>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-auto">
                        <button 
                          onClick={handleResetPrices}
                          className="underline hover:text-white dark:hover:text-white flex items-center space-x-1"
                          title="Kembalikan semua harga produk ke standard bawaan"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Reset DB</span>
                        </button>

                        <button 
                          onClick={() => setIsCreateProductModalOpen(true)}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] px-3 py-1.5 flex items-center space-x-1 shadow-sm transition"
                          title="Tambah jenis jasa cetak baru kustom ke dalam katalog"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Tambah Jasa Baru</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                  <button
                    onClick={() => generateCatalogPDF(PRODUCTS)}
                    id="download-catalog-pdf-btn"
                    className="flex items-center justify-center space-x-2 rounded-xl bg-amber-550 hover:bg-amber-600 dark:bg-[#FFCC00] dark:hover:bg-amber-400 text-slate-950 px-4 py-2.5 text-xs font-black transition shadow-sm cursor-pointer w-full sm:w-auto shrink-0"
                    title="Download katalog penawaran harga lengkap (PDF) untuk offline"
                  >
                    <FileDown className="h-4 w-4 shrink-0 text-slate-950" />
                    <span>Unduh Katalog PDF</span>
                  </button>

                  <div className="relative w-full md:w-64 flex items-center">
                    <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Cari layanan atau bahan..."
                      id="search-input-catalog"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14161b] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-amber-500 dark:focus:border-white/30 focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-neutral-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Categories horizontal pill lists (Comfort & Beautiful Accent Theme) */}
              <div className="flex overflow-x-auto pb-2 scrollbar-none gap-2" id="category-pills">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`cat-pill-${cat.id}`}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center space-x-2 rounded-full border px-4 py-2 text-xs font-bold transition shrink-0 ${
                        isActive
                          ? 'border-[#FFCC00] bg-[#FFCC00] text-slate-950 shadow-md font-black'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-[#121316] dark:text-neutral-300 dark:hover:bg-[#1a1d24] dark:hover:text-white shadow-xs'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ====== PRODUCTS GRID (Masonry Showcase for varied description heights) ====== */}
              {filteredProducts.length > 0 ? (
                <div 
                  id="products-catalog-grid"
                  className="columns-1 sm:columns-2 lg:columns-3 gap-6 md:gap-7 space-y-6 [column-fill:_balance]"
                >
                  {filteredProducts.map((p) => (
                    <div key={p.id} className="break-inside-avoid mb-6">
                      <ProductCard
                        product={p}
                        onSelect={(prod) => setSelectedProduct(prod)}
                        role={role}
                        onAdminEdit={(prod) => setActiveAdminEditProduct(prod)}
                        onViewMaterials={(prod) => setSelectedCatalogProduct(prod)}
                        onDeleteProduct={handleDeleteProduct}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-black/15 dark:border-white/10 rounded-2xl bg-neutral-100/70 dark:bg-[#121316]/50" id="no-search-results">
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Layanan cetakan tidak ditemukan</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Coba gunakan kata kunci pencarian lain atau pilih kategori Semua Jasa.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="mt-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1c1f26] px-4 py-2 text-xs font-bold text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-[#252a34] transition shadow-xs"
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

      {/* 3. Footer (VosPrint Theme) */}
      <footer className="bg-neutral-100 dark:bg-[#0c0d10] text-neutral-600 dark:text-neutral-400 text-xs py-10 px-4 border-t border-black/10 dark:border-white/10 text-center" id="main-footer">
        <div className="mx-auto max-w-7xl space-y-4" id="footer-content">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-5">
            <div className="text-left flex items-center" id="footer-branding">
              <VosPrintLogo size="sm" showSubtitle={false} />
              <div className="ml-3 pl-3 border-l border-slate-300 dark:border-white/10">
                <p className="text-[11px] font-semibold text-slate-700 dark:text-neutral-300">vosprint Digital & Offset Hub</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Platform Pemesanan & Kalkulator Jasa Percetakan Otomatis</p>
              </div>
            </div>
            
            {/* Quick Contact Footer */}
            <div className="flex items-center space-x-3 text-[11px]" id="footer-quick-contact">
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER_DEFAULT}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>WhatsApp Admin (+{WHATSAPP_NUMBER_DEFAULT})</span>
              </a>
            </div>
          </div>

          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-normal" id="footer-dev-note">
            Aplikasi ini dirancang menggunakan sistem responsive layout modern. Sebagai admin/moderator, Anda dapat menggunakan tombol di bagian atas navigasi untuk menyesuaikan katalog harga secara instan.
          </p>

          <p className="text-[10px] text-neutral-400 dark:text-neutral-500" id="footer-copyright">
            &copy; {new Date().getFullYear()} vosprint. All rights reserved.
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
