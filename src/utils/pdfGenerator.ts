import { jsPDF } from 'jspdf';
import { Product } from '../types';

export const generateCatalogPDF = (products: Product[]) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Header banner
  doc.setFillColor(20, 22, 27); // Deep dark
  doc.rect(0, 0, 210, 42, 'F');
  
  // Top brand decoration line
  doc.setFillColor(255, 204, 0); // #FFCC00
  doc.rect(0, 0, 210, 3, 'F');
  
  // Brand title
  doc.setTextColor(255, 204, 0); // #FFCC00
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('VOSPRINT', 15, 20);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFLINE CATALOG & PENAWARAN HARGA MITRA', 15, 28);
  
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('Jl. Raya Percetakan No. 12, Jakarta | No. WA: 0853-3949-9687', 15, 34);
  
  // Right metadata info
  const today = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DOKUMEN PENAWARAN', 142, 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 200);
  doc.text(`Hari/Tgl: ${today}`, 142, 24);
  doc.text('Status: Aktif/Valid', 142, 30);
  
  let y = 56;
  
  products.forEach((product, idx) => {
    // Safe check for page height limit
    if (y > 245) {
      doc.addPage();
      y = 20;
    }
    
    // Product title block decoration (Yellow tag)
    doc.setFillColor(255, 204, 0);
    doc.rect(15, y - 1, 3.5, 7.5, 'F');
    
    doc.setTextColor(20, 22, 27);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(`${idx + 1}. ${product.name}`, 21, y + 5);
    
    // Tag Category
    doc.setFillColor(240, 242, 245);
    doc.rect(160, y, 35, 6, 'F');
    doc.setTextColor(70, 80, 95);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(product.category.toUpperCase(), 165, y + 4.2);
    
    y += 11;
    
    // Description block
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const splitDesc = doc.splitTextToSize(product.description, 180);
    doc.text(splitDesc, 15, y);
    y += (splitDesc.length * 4.5) + 3;
    
    // Price highlight
    doc.setFillColor(255, 248, 220); // Warm cream highlight for price
    doc.rect(15, y - 1, 180, 7.5, 'F');
    doc.setDrawColor(255, 220, 110);
    doc.rect(15, y - 1, 180, 7.5, 'S');
    
    doc.setTextColor(180, 80, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.basePrice);
    doc.text(`Harga Dasar/Standard:  ${formattedPrice} per ${product.unit}`, 18, y + 4.2);
    y += 12;
    
    // Option Tables Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 110);
    doc.text('SPESIFIKASI BAHAN & DETAIL FINISHING:', 15, y);
    y += 5.5;
    
    // Parallel Columns for Materials & Finishings
    const colWidth = 86;
    const materialsYStart = y;
    let maxColY = y;
    
    // Col 1: Materials
    if (product.materials && product.materials.length > 0) {
      let matY = materialsYStart;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text('Pilihan Bahan:', 17, matY);
      matY += 4.5;
      
      product.materials.forEach((m) => {
        if (matY > 265) {
          doc.addPage();
          matY = 25;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(90, 90, 90);
        const extraText = m.extraPrice > 0 ? ` (+Rp ${m.extraPrice.toLocaleString('id-ID')})` : ' (Standard)';
        doc.text(`• ${m.name}${extraText}`, 19, matY);
        matY += 4.2;
      });
      maxColY = Math.max(maxColY, matY);
    }
    
    // Col 2: Finishings
    if (product.finishings && product.finishings.length > 0) {
      let finY = materialsYStart;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.text('Pilihan Finishing:', 110, finY);
      finY += 4.5;
      
      product.finishings.forEach((f) => {
        if (finY > 265) {
          doc.addPage();
          finY = 25;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(90, 90, 90);
        const priceText = f.price > 0 ? ` (+Rp ${f.price.toLocaleString('id-ID')})` : ' (Gratis)';
        doc.text(`• ${f.name}${priceText}`, 112, finY);
        finY += 4.2;
      });
      maxColY = Math.max(maxColY, finY);
    }
    
    y = maxColY + 4;
    
    // Light divider line
    doc.setDrawColor(232, 235, 240);
    doc.line(15, y, 195, y);
    y += 9;
  });
  
  // Footer generation
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Bottom border line
    doc.setFillColor(255, 204, 0);
    doc.rect(15, 282, 180, 1.2, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(140, 140, 140);
    doc.text(`Halaman ${i} dari ${pageCount}`, 15, 288);
    doc.text('vosprint © 2026 Digital & Offset Printing - Dokumen Penawaran Otomatis', 105, 288);
  }
  
  doc.save('vosprint_Katalog_Produk.pdf');
};
