/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DesignTemplate } from '../types';

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'tpl-banner-warung',
    title: 'Spanduk Kuliner & Warung Makan',
    category: 'banner',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    description: 'Desain menarik berlatar hangat merah-kuning dengan slot nama menu, foto makanan, & nomor telepon order.',
    tags: ['Warung', 'Spanduk', 'Kuliner', 'Promosi'],
    suggestedProduct: 'spanduk-flexi'
  },
  {
    id: 'tpl-banner-laundry',
    title: 'Spanduk Kiloan & Dry Clean Laundry',
    category: 'banner',
    imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
    description: 'Warna biru segar cerah, tabel harga per kg, layanan sameday, & garansi wangi bersih.',
    tags: ['Laundry', 'Jasa', 'Banner Outdoor'],
    suggestedProduct: 'spanduk-flexi'
  },
  {
    id: 'tpl-stiker-botol',
    title: 'Stiker Kemasan Minuman Kekinian',
    category: 'stiker',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    description: 'Desain melingkar elegan dengan logo coffee shop/boba, Varian Rasa, dan Social Media handle.',
    tags: ['Minuman', 'Stiker Botol', 'Branding UMKM'],
    suggestedProduct: 'stiker-chromo-vinyl'
  },
  {
    id: 'tpl-stiker-makanan',
    title: 'Stiker Label Makanan Ringan / Snack',
    category: 'stiker',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80',
    description: 'Label kotak/oval dengan rincian Komposisi, Berat Bersih, Nomor P-IRT / Halal, & Kontak Admin.',
    tags: ['Label Produk', 'Snack', 'Stiker Vinyl'],
    suggestedProduct: 'stiker-chromo-vinyl'
  },
  {
    id: 'tpl-kartu-bisnis-minimalis',
    title: 'Kartu Nama Modern Executive',
    category: 'kartu_nama',
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    description: 'Gaya kontemporer bersih dengan font san-serif tegas, aksen emas, QR Code Kontak, dan logo emboss.',
    tags: ['Kartu Nama', 'Minimalis', 'Profesional'],
    suggestedProduct: 'kartu-nama'
  },
  {
    id: 'tpl-brosur-event',
    title: 'Brosur Promo / Flier Event Diskon',
    category: 'brosur',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    description: 'Tata letak A4/A5 lipat 3 serbaguna untuk pengumuman diskon toko, pendaftaran les, atau daftar harga jasa.',
    tags: ['Brosur', 'Flier A5', 'Pemasaran'],
    suggestedProduct: 'brosur-flyer'
  },
  {
    id: 'tpl-x-banner-seminar',
    title: 'X-Banner Standing Event & Seminar',
    category: 'display',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80',
    description: 'Display tegak 60x160cm dengan tajuk acara menonjol, foto pembicara, waktu, & alamat lokasi.',
    tags: ['X-Banner', 'Display Booth', 'Seminar'],
    suggestedProduct: 'x-banner-y-banner'
  }
];
