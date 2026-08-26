/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, StoreHours, OrderRecord, DesignTemplate } from '../types';
import { getSessionToken } from './adminAuth';

export interface StoreSettings {
  whatsappNumber: string;
  customQrImage?: string;
  storeName?: string;
}

export interface StoreDataResponse {
  products: Product[];
  storeHours: StoreHours;
  storeSettings: StoreSettings;
  orders: OrderRecord[];
  templates: DesignTemplate[];
  updatedAt: string;
}

/**
 * Fetch all centralized store data (products, hours, settings, orders, templates) from backend
 */
export async function fetchCentralStoreData(): Promise<StoreDataResponse | null> {
  try {
    const res = await fetch('/api/store-data', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('[StoreApi] Failed to fetch central store data:', err);
  }
  return null;
}

/**
 * Save complete products catalog to server (Admin only)
 */
export async function syncProductsToServer(products: Product[]): Promise<{ success: boolean; message: string }> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ products })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal menghubungi server untuk menyimpan produk.' };
  }
}

/**
 * Update or insert single product on server (Admin only)
 */
export async function syncSingleProductToServer(product: Product): Promise<{ success: boolean; message: string }> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/products/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ product })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan perubahan produk ke server.' };
  }
}

/**
 * Delete product from server (Admin only)
 */
export async function deleteProductFromServer(productId: string): Promise<{ success: boolean; message: string }> {
  try {
    const token = getSessionToken();
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token || ''}`
      }
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal menghapus produk dari server.' };
  }
}

/**
 * Save store operating hours to server (Admin only)
 */
export async function syncStoreHoursToServer(storeHours: StoreHours): Promise<{ success: boolean; message: string }> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/store-hours', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ storeHours })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan jam operasional ke server.' };
  }
}

/**
 * Save WhatsApp / QR settings to server (Admin only)
 */
export async function syncStoreSettingsToServer(storeSettings: Partial<StoreSettings>): Promise<{ success: boolean; message: string }> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/store-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ storeSettings })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan pengaturan WhatsApp & QR ke server.' };
  }
}

/**
 * Submit or update customer order to server
 */
export async function submitOrderToServer(order: OrderRecord): Promise<{ success: boolean; message: string; orders?: OrderRecord[] }> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal menyimpan pesanan ke server.' };
  }
}

/**
 * Update order status on server (Admin only)
 */
export async function updateOrderStatusOnServer(orderId: string, status: string, note?: string): Promise<{ success: boolean; message: string; order?: OrderRecord; orders?: OrderRecord[] }> {
  try {
    const token = getSessionToken();
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ status, note })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal memperbarui status pesanan di server.' };
  }
}

/**
 * Save design templates to server (Admin only)
 */
export async function syncTemplatesToServer(templates: DesignTemplate[]): Promise<{ success: boolean; message: string }> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({ templates })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal menyinkronkan template ke server.' };
  }
}

/**
 * Reset catalog & store settings to factory default (Admin only)
 */
export async function resetCatalogOnServer(): Promise<{ success: boolean; message: string; products?: Product[]; storeHours?: StoreHours }> {
  try {
    const token = getSessionToken();
    const res = await fetch('/api/reset-catalog', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token || ''}`
      }
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, message: 'Gagal mereset katalog di server.' };
  }
}
