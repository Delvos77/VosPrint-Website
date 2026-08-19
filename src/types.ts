/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductCategory = 'all' | 'banner' | 'stiker' | 'brosur' | 'kartu_nama' | 'display';

export interface MaterialOption {
  id: string;
  name: string;
  extraPrice: number; // Tambahan harga per m2, per lembar, atau per box
  description?: string;
  imageUrl?: string;
}

export interface FinishingOption {
  id: string;
  name: string;
  price: number; // Harga per unit atau flat tergantung tipe
  isPerUnit: boolean; // Jika true, dikali kuantitas. Jika false, flat.
  description: string;
}

export type PricingType = 'area' | 'sheet' | 'box' | 'fixed' | 'grid';

export interface GridPriceRow {
  pages: number;
  prices: number[]; // matching the tiers array length
}

export interface ProductGridPrices {
  tiers: number[]; // e.g. [4, 20, 50, 100, 200, 300, 400]
  rows: GridPriceRow[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number; // Harga dasar
  unit: string; // m², lembar A3+, box, set, dll.
  minQty: number;
  pricingType: PricingType;
  materials: MaterialOption[];
  finishings: FinishingOption[];
  imageGradient: string; // CSS Gradient classes for visual representation
  iconName: string; // Lucide icon identifier
  gridPrices?: ProductGridPrices; // Optional tiered pricing grid (like Cetak Buku)
  customImageUrl?: string; // Uploaded custom visual image base64 URL
}

export type FileQualityRating = 'high' | 'medium' | 'low';

export interface CartItem {
  id: string; // Unique ID untuk item di keranjang
  productId: string;
  productName: string;
  category: string;
  pricingType: PricingType;
  unit: string;
  material: MaterialOption;
  width?: number; // dalam meter, untuk tipe 'area'
  length?: number; // dalam meter, untuk tipe 'area'
  pages?: number; // jumlah halaman, untuk tipe 'grid' (seperti buku)
  finishing: FinishingOption[];
  quantity: number;
  designUrl: string;
  uploadedFileName?: string;
  fileQuality?: FileQualityRating;
  fileSizeMb?: number;
  notes: string;
  subtotal: number;
  originalSubtotal?: number;
  wholesaleDiscountPercent?: number;
}

export interface OrderInfo {
  name: string;
  whatsapp: string;
  deliveryMethod: 'pickup' | 'delivery';
  address: string;
}

export interface StoreHours {
  openDays: string;
  openTime: string;
  closeTime: string;
  closedDaysInfo: string;
  timezone?: string;
}

export type OrderStatus = 'pending' | 'checking_file' | 'printing' | 'finishing' | 'ready' | 'completed';

export interface StatusLog {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface OrderRecord {
  id: string; // e.g. "INV-20260819-001"
  createdAt: string;
  updatedAt?: string;
  customerName: string;
  whatsapp: string;
  deliveryMethod: 'pickup' | 'delivery';
  address?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  statusHistory?: StatusLog[];
}

export interface DesignTemplate {
  id: string;
  title: string;
  category?: ProductCategory;
  imageUrl: string;
  description: string;
  tags: string[];
  suggestedProduct?: string;
}

export interface WholesaleTier {
  minQty: number;
  discountPercent: number; // e.g. 5 = 5% off
  label: string;
}
