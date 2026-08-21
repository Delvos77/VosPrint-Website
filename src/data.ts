/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, CartItem } from './types';

export const WHATSAPP_NUMBER_DEFAULT = '6285339499687'; // Nomor WA Admin CetakInstan

export const PRODUCTS: Product[] = [
  {
    id: 'spanduk-flexi',
    name: 'Spanduk / Banner Flexi',
    category: 'banner',
    description: 'Cetak spanduk promosi, baliho, atau banner outdoor/indoor dengan bahan tebal berkualitas tinggi.',
    basePrice: 20000, // Rp 20.000 / m²
    unit: 'm²',
    minQty: 1, // minimal 1 m²
    pricingType: 'area',
    imageGradient: 'from-slate-900 via-neutral-900 to-slate-800',
    customImageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    iconName: 'Image',
    materials: [
      { id: 'flexi-280', name: 'Flexi Standard 280gr', extraPrice: 0 },
      { id: 'flexi-340', name: 'Flexi High-Res 340gr', extraPrice: 10000 },
      { id: 'flexi-korcin', name: 'Flexi Korea Cina 440gr (Sangat Tebal)', extraPrice: 25000 }
    ],
    finishings: [
      { id: 'mata-ayam', name: 'Mata Ayam (Ring Lubang - per 4 sisi)', price: 3000, isPerUnit: true, description: 'Ring besi di ujung-ujung spanduk untuk tali pengikat.' },
      { id: 'potong-pas', name: 'Potong Pas (Tanpa Sisa Putih)', price: 0, isPerUnit: false, description: 'Dipotong pas sesuai ukuran desain.' },
      { id: 'lipat-lem', name: 'Lipat Lem Keliling (Rapi)', price: 2000, isPerUnit: true, description: 'Pinggiran dilipat dan dilem agar lebih kuat & rapi.' },
      { id: 'selongsong', name: 'Selongsong (Kiri-Kanan/Atas-Bawah)', price: 4000, isPerUnit: false, description: 'Lubang selongsong kosong untuk dimasukkan bambu/kayu.' }
    ]
  },
  {
    id: 'stiker-chromo-vinyl',
    name: 'Stiker Chromo / Vinyl A3+',
    category: 'stiker',
    description: 'Cetak stiker kemasan produk, label botol, atau stiker komunitas. Pilihan bahan kertas (chromo) atau plastik tahan air (vinyl).',
    basePrice: 12000, // Rp 12.000 / lembar A3+
    unit: 'lembar A3+',
    minQty: 5, // minimal 5 lembar A3+
    pricingType: 'sheet',
    imageGradient: 'from-neutral-900 to-stone-900',
    customImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    iconName: 'Layers',
    materials: [
      { id: 'chromo', name: 'Stiker Chromo (Bahan Kertas, Semi-Glossy)', extraPrice: 0 },
      { id: 'vinyl-matte', name: 'Stiker Vinyl Matte (Plastik, Tahan Air, Doff)', extraPrice: 5000 },
      { id: 'vinyl-glossy', name: 'Stiker Vinyl Glossy (Plastik, Tahan Air, Mengkilap)', extraPrice: 5000 },
      { id: 'vinyl-transparan', name: 'Stiker Vinyl Transparan (Tembus Pandang)', extraPrice: 7000 }
    ],
    finishings: [
      { id: 'tanpa-potong', name: 'Tanpa Potong (Lembaran A3+)', price: 0, isPerUnit: false, description: 'Dikirim dalam bentuk lembaran utuh.' },
      { id: 'kiss-cut', name: 'Potong Setengah Putus (Kiss Cut)', price: 3000, isPerUnit: true, description: 'Stiker dipotong setengah putus, tinggal dikelupas dari lembaran.' },
      { id: 'die-cut', name: 'Potong Putus (Die Cut / Pcs)', price: 6000, isPerUnit: true, description: 'Stiker dipotong putus per satuan pcs.' },
      { id: 'laminasi-doff', name: 'Laminasi Dingin Doff', price: 3000, isPerUnit: true, description: 'Lapisan pelindung tambahan bertekstur doff/matte halus.' },
      { id: 'laminasi-glossy', name: 'Laminasi Dingin Glossy', price: 3000, isPerUnit: true, description: 'Lapisan pelindung tambahan mengkilap & mewah.' }
    ]
  },
  {
    id: 'brosur-flyer',
    name: 'Brosur / Flyer Promosi',
    category: 'brosur',
    description: 'Media promosi cetak resolusi tinggi untuk membagikan informasi event, menu makanan, atau katalog produk singkat.',
    basePrice: 75000, // Rp 75.000 / pack (isi 100 lembar)
    unit: 'pack (100 lbr)',
    minQty: 1, // minimal 1 pack
    pricingType: 'box',
    imageGradient: 'from-stone-900 to-zinc-900',
    customImageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    iconName: 'FileText',
    materials: [
      { id: 'art-paper-120', name: 'Art Paper 120gr (Standard Brosur)', extraPrice: 0 },
      { id: 'art-paper-150', name: 'Art Paper 150gr (Lebih Tebal & Premium)', extraPrice: 15000 },
      { id: 'art-carton-260', name: 'Art Carton 260gr (Sangat Tebal, seperti Kartu)', extraPrice: 35000 },
      { id: 'hvs-80', name: 'Kertas HVS 80gr (Ekonomis, Matte)', extraPrice: -10000 }
    ],
    finishings: [
      { id: 'lipat-2', name: 'Lipat 2 (Tengah)', price: 5000, isPerUnit: true, description: 'Dilipat menjadi 2 bagian sama rata.' },
      { id: 'lipat-3', name: 'Lipat 3 (Model Brosur Lipat)', price: 8000, isPerUnit: true, description: 'Dilipat menjadi 3 halaman/bagian.' },
      { id: 'laminasi-brosur-doff', name: 'Laminasi Doff (Khusus Art Carton)', price: 15000, isPerUnit: true, description: 'Laminasi doff premium agar cetakan tidak mudah sobek & lecek.' }
    ]
  },
  {
    id: 'kartu-nama',
    name: 'Kartu Nama Bisnis',
    category: 'kartu_nama',
    description: 'Kartu identitas profesional untuk memperluas jejaring bisnis Anda. Satu box berisi 100 lembar kartu nama.',
    basePrice: 35000, // Rp 35.000 / box
    unit: 'box (100 lbr)',
    minQty: 1, // minimal 1 box
    pricingType: 'box',
    imageGradient: 'from-zinc-950 via-slate-900 to-black',
    customImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    iconName: 'CreditCard',
    materials: [
      { id: 'ac-260', name: 'Art Carton 260gr (Standard)', extraPrice: 0 },
      { id: 'ac-310', name: 'Art Carton 310gr (Lebih Kokoh)', extraPrice: 8000 },
      { id: 'bw-premium', name: 'Blues White Premium (Matte Mewah, Tekstur Kertas)', extraPrice: 20000 }
    ],
    finishings: [
      { id: 'no-lam', name: 'Tanpa Laminasi', price: 0, isPerUnit: false, description: 'Cetakan asli tanpa lapisan tambahan.' },
      { id: 'lam-doff-2s', name: 'Laminasi Doff (2 Sisi)', price: 12000, isPerUnit: true, description: 'Laminasi bolak-balik doff agar tampak eksklusif dan tahan air.' },
      { id: 'lam-glossy-2s', name: 'Laminasi Glossy (2 Sisi)', price: 12000, isPerUnit: true, description: 'Laminasi bolak-balik mengkilap memantulkan cahaya.' },
      { id: 'sudut-rounded', name: 'Sudut Rounded (Melengkung)', price: 5000, isPerUnit: true, description: 'Potong sudut kartu nama agar melengkung (tidak tajam).' }
    ]
  },
  {
    id: 'roll-up-banner',
    name: 'Roll Up / X-Banner Stand',
    category: 'display',
    description: 'Display promosi praktis lengkap dengan tiang penyangga / stand aluminium. Cocok untuk toko, pameran, dan seminar.',
    basePrice: 65000, // Rp 65.000 / set
    unit: 'set',
    minQty: 1, // minimal 1 set
    pricingType: 'fixed',
    imageGradient: 'from-neutral-900 to-zinc-900',
    customImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    iconName: 'Presentation',
    materials: [
      { id: 'flexi-340-display', name: 'Bahan Flexi High-Res 340gr (Ekonomis)', extraPrice: 0 },
      { id: 'luster-premium', name: 'Bahan Luster Premium (Tekstur Pasir, Mewah)', extraPrice: 40000 },
      { id: 'albatros-lam', name: 'Bahan Albatros + Laminasi Doff (Halus, Tidak Melengkung)', extraPrice: 55000 }
    ],
    finishings: [
      { id: 'x-stand-fiber', name: 'Rangka X-Banner Standard (Fiber Hitam)', price: 0, isPerUnit: false, description: 'Penyangga berbentuk X dari fiber kuat.' },
      { id: 'y-stand', name: 'Rangka Y-Banner (Besi Kokoh)', price: 15000, isPerUnit: true, description: 'Penyangga berbentuk Y dengan kestabilan lebih baik.' },
      { id: 'roll-up-alu', name: 'Rangka Roll Up Aluminium (Mudah Digulung)', price: 125000, isPerUnit: true, description: 'Stand premium dari aluminium, banner bisa ditarik dan menggulung otomatis ke dalam tabung.' }
    ]
  },
  {
    id: 'cetak-buku-custom',
    name: 'Cetak Buku / Novel Custom',
    category: 'brosur',
    description: 'Cetak buku, novel, komik, atau majalah berkualitas dengan jilid Perfect Binding premium & jilid lem panas.',
    basePrice: 33000,
    unit: 'buku',
    minQty: 4,
    pricingType: 'grid',
    imageGradient: 'from-black via-zinc-900 to-neutral-900',
    customImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    iconName: 'BookOpen',
    materials: [
      { id: 'bookpaper-72', name: 'Bahan Isi: Bookpaper 72gr (Standard Novel)', extraPrice: 0 },
      { id: 'hvs-70-buku', name: 'Bahan Isi: Kertas HVS 70gr (Putih, Ekonomis)', extraPrice: -2000 },
      { id: 'artpaper-150-buku', name: 'Bahan Isi: Art Paper 150gr (Glossy, Premium)', extraPrice: 15000 }
    ],
    finishings: [
      { id: 'perfect-binding', name: 'Jilid Lem Panas (Perfect Binding)', price: 5000, isPerUnit: true, description: 'Jilid punggung buku profesional berperekat lem kuat.' },
      { id: 'lam-doff-buku', name: 'Laminasi Doff Cover (Semi-Matte)', price: 2000, isPerUnit: true, description: 'Lapisan pelindung doff halus pada cover.' },
      { id: 'lam-glossy-buku', name: 'Laminasi Glossy Cover (Mengkilap)', price: 2000, isPerUnit: true, description: 'Lapisan pelindung mengkilap mewah pada cover.' },
      { id: 'wrapping-plastik', name: 'Wrapping Plastik (Shrink Wrap)', price: 1500, isPerUnit: true, description: 'Kemasan plastik press rapi satu per satu.' }
    ],
    gridPrices: {
      tiers: [4, 20, 50, 100, 200, 300, 400],
      rows: [
        { pages: 80, prices: [33000, 31260, 29440, 28120, 26800, 25480, 24660] },
        { pages: 100, prices: [36500, 34700, 32800, 31400, 30000, 28600, 27700] },
        { pages: 120, prices: [40000, 38140, 36160, 34680, 33200, 31720, 30740] },
        { pages: 140, prices: [43500, 41580, 39520, 37960, 36400, 34840, 33780] },
        { pages: 160, prices: [47000, 45020, 42880, 41240, 39600, 37960, 36820] },
        { pages: 180, prices: [50500, 48460, 46240, 44520, 42800, 41080, 39860] },
        { pages: 200, prices: [54000, 51900, 49600, 47800, 46000, 44200, 42900] },
        { pages: 220, prices: [57500, 55340, 52960, 51080, 49200, 47320, 45940] },
        { pages: 240, prices: [61000, 58780, 56320, 54360, 52400, 50440, 48980] },
        { pages: 260, prices: [64500, 62220, 59680, 57640, 55600, 53560, 52020] },
        { pages: 280, prices: [68000, 65660, 63040, 60920, 58800, 56680, 55060] },
        { pages: 300, prices: [71500, 69100, 66400, 64200, 62000, 59800, 58100] }
      ]
    }
  }
];

/**
 * Fungsi untuk menghitung harga cetak secara akurat dan transparan.
 * Penjelasan Rumus Harga:
 * 1. Tipe 'area' (Meteran: Panjang x Lebar x Qty):
 *    - Hitung luas total: Luas = Panjang * Lebar (dibulatkan ke atas minimal 1 m² jika kurang)
 *    - Harga Satuan = BasePrice + extraPrice material
 *    - Total Finishing = Jumlah dari (Harga finishing * Qty) [atau flat]
 *    - Subtotal = (Luas * Harga Satuan * Qty) + Total Finishing
 * 
 * 2. Tipe 'sheet' (Per lembar A3+):
 *    - Harga Satuan = BasePrice + extraPrice material
 *    - Total Finishing = Jumlah dari (Harga finishing * Qty) [atau flat]
 *    - Subtotal = (Harga Satuan * Qty) + Total Finishing
 * 
 * 3. Tipe 'box' (Per pack/box):
 *    - Harga Satuan = BasePrice + extraPrice material
 *    - Total Finishing = Jumlah dari (Harga finishing * Qty) [atau flat]
 *    - Subtotal = (Harga Satuan * Qty) + Total Finishing
 * 
 * 4. Tipe 'fixed' (Per set):
 *    - Harga Satuan = BasePrice + extraPrice material
 *    - Total Finishing = Jumlah dari (Harga finishing * Qty) [atau flat]
 *    - Subtotal = (Harga Satuan * Qty) + Total Finishing
 * 
 * 5. Tipe 'grid' (Tiered Grid Lookup - seperti Buku):
 *    - Berdasarkan jumlah halaman & Qty eks, ambil harga satuan dari grid lookup table.
 *    - Harga Satuan = Harga Grid + extraPrice material
 *    - Subtotal = (Harga Satuan * Qty) + Total Finishing
 */
export function getWholesaleDiscountPercent(quantity: number): number {
  if (quantity >= 100) return 15;
  if (quantity >= 50) return 10;
  if (quantity >= 10) return 5;
  return 0;
}

export function calculatePrintPrice(params: {
  product: Product;
  material: { id: string; name: string; extraPrice: number };
  width?: number; // dalam meter
  length?: number; // dalam meter
  pages?: number; // jumlah halaman (khusus tipe grid)
  finishing: { id: string; name: string; price: number; isPerUnit: boolean }[];
  quantity: number;
}): {
  unitPrice: number;
  materialExtra: number;
  finishingTotal: number;
  calculatedArea?: number;
  originalTotal: number;
  wholesaleDiscountPercent: number;
  discountSavings: number;
  total: number;
} {
  const { product, material, width = 1, length = 1, pages = 80, finishing, quantity } = params;

  let unitPrice = product.basePrice;
  const materialExtra = material.extraPrice;

  // Jika bertipe grid (seperti Cetak Buku Custom), lakukan pencarian di tabel tiered grid
  if (product.pricingType === 'grid' && product.gridPrices) {
    const { tiers, rows } = product.gridPrices;
    
    // 1. Cari indeks tier kuantitas (step-down terbesar yang <= quantity)
    let tierIndex = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (quantity >= tiers[i]) {
        tierIndex = i;
      }
    }

    // 2. Cari baris halaman yang paling mendekati pages pilihan user
    let closestRow = rows[0];
    let minDiff = Math.abs(rows[0].pages - pages);
    for (const r of rows) {
      const diff = Math.abs(r.pages - pages);
      if (diff < minDiff) {
        minDiff = diff;
        closestRow = r;
      }
    }

    // Ambil harga dari grid
    const gridPriceLookup = closestRow.prices[tierIndex] !== undefined 
      ? closestRow.prices[tierIndex] 
      : closestRow.prices[0];
    
    unitPrice = gridPriceLookup;
  }

  const itemBaseCost = unitPrice + materialExtra;

  let finishingTotal = 0;
  finishing.forEach((f) => {
    if (f.isPerUnit) {
      finishingTotal += f.price * quantity;
    } else {
      finishingTotal += f.price;
    }
  });

  let total = 0;
  let calculatedArea = 0;

  if (product.pricingType === 'area') {
    // Panjang x Lebar dalam meter, minimal 0.1m
    const w = Math.max(0.1, width);
    const l = Math.max(0.1, length);
    // Luas per pcs
    calculatedArea = w * l;
    
    // Total biaya cetak = Luas * Harga Bahan Per m2 * Qty
    const printingCost = Math.round(calculatedArea * itemBaseCost * quantity);
    
    // Lipat lem khusus dihitung per keliling banner
    // Keliling = 2 * (P + L)
    // Jika user memilih lipat lem, harganya dikali keliling * qty
    let customFinishingCost = 0;
    finishing.forEach((f) => {
      if (f.id === 'lipat-lem') {
        const perimeter = 2 * (w + l);
        // hapus double counting lipat-lem dari looping standar di atas
        // gantikan dengan hitungan perimeter
        const standardCost = f.isPerUnit ? f.price * quantity : f.price;
        customFinishingCost += (Math.round(perimeter * f.price) * quantity) - standardCost;
      }
    });

    total = printingCost + finishingTotal + customFinishingCost;
  } else {
    // Tipe non-area (sheet, box, fixed, grid)
    total = (itemBaseCost * quantity) + finishingTotal;
  }

  // Minimum total harga adalah 0 jika terjadi nilai negatif
  const originalTotal = Math.max(0, total);
  const wholesaleDiscountPercent = getWholesaleDiscountPercent(quantity);
  const discountSavings = Math.round((originalTotal * wholesaleDiscountPercent) / 100);
  const finalTotal = Math.max(0, originalTotal - discountSavings);

  return {
    unitPrice: itemBaseCost,
    materialExtra,
    finishingTotal,
    calculatedArea: product.pricingType === 'area' ? calculatedArea : undefined,
    originalTotal,
    wholesaleDiscountPercent,
    discountSavings,
    total: finalTotal
  };
}

/**
 * Format angka ke mata uang Rupiah (IDR)
 */
export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
