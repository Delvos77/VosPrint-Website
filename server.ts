import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { PRODUCTS, WHATSAPP_NUMBER_DEFAULT } from "./src/data.ts";

// Load environment variables
dotenv.config();

const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "vosprint-secure-default-session-secret-2026-super-key";
const ADMIN_PIN_DEFAULT = process.env.ADMIN_PIN_DEFAULT || "2457";
const ADMIN_PIN_PEPPER = process.env.ADMIN_PIN_PEPPER || "vosprint-pepper-secret-random-salt-2026";

const DATA_DIR = path.join(process.cwd(), "data");
const SECURITY_FILE = path.join(DATA_DIR, "admin-security.json");
const STORE_DATA_FILE = path.join(DATA_DIR, "store-data.json");

// -------------------------------------------------------------
// 1. SECURE PASSWORD / PIN HASHING UTILITIES (Node.js Crypto)
// -------------------------------------------------------------
interface SecurityStore {
  pinHash: string;
  salt: string;
  updatedAt: string;
  isDefaultPin: boolean;
  failedAttempts: Record<string, { count: number; lockedUntil: number; lastAttempt: string }>;
  blockedDevices: Array<{ id: string; ipAlias: string; failedCount: number; blockedAt: string; isBlocked: boolean }>;
}

function hashPin(pin: string, salt: string): string {
  const combined = `${pin}:${ADMIN_PIN_PEPPER}`;
  return crypto.pbkdf2Sync(combined, salt, 10000, 64, "sha512").toString("hex");
}

function loadSecurityStore(): SecurityStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SECURITY_FILE)) {
      const data = JSON.parse(fs.readFileSync(SECURITY_FILE, "utf-8"));
      return {
        pinHash: data.pinHash || "",
        salt: data.salt || "",
        updatedAt: data.updatedAt || new Date().toISOString(),
        isDefaultPin: data.isDefaultPin ?? false,
        failedAttempts: data.failedAttempts || {},
        blockedDevices: data.blockedDevices || []
      };
    }
  } catch (err) {
    console.error("[Auth] Error reading security store:", err);
  }

  // Initialize with ADMIN_PIN_DEFAULT
  const initialSalt = crypto.randomBytes(16).toString("hex");
  const initialHash = hashPin(ADMIN_PIN_DEFAULT, initialSalt);
  const initialStore: SecurityStore = {
    pinHash: initialHash,
    salt: initialSalt,
    updatedAt: new Date().toISOString(),
    isDefaultPin: true,
    failedAttempts: {},
    blockedDevices: []
  };

  try {
    fs.writeFileSync(SECURITY_FILE, JSON.stringify(initialStore, null, 2));
  } catch (err) {
    console.error("[Auth] Error writing initial security store:", err);
  }

  return initialStore;
}

function saveSecurityStore(store: SecurityStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SECURITY_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error("[Auth] Error saving security store:", err);
  }
}

let securityStore = loadSecurityStore();

// Session token generation & verification (HMAC SHA-256)
function generateSessionToken(role: string = "moderator"): string {
  const timestamp = Date.now();
  const randomNonce = crypto.randomBytes(8).toString("hex");
  const payload = `${role}:${timestamp}:${randomNonce}`;
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

function verifySessionToken(token: string): { valid: boolean; role?: string; expired?: boolean } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return { valid: false };

    const [role, timestampStr, randomNonce, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE) {
      return { valid: false, expired: true };
    }

    const payload = `${role}:${timestampStr}:${randomNonce}`;
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return { valid: true, role };
    }
  } catch (err) {
    // Malformed token
  }
  return { valid: false };
}

// -------------------------------------------------------------
// 2. CENTRALIZED STORE DATA STORAGE (Products, Hours, Settings, Orders)
// -------------------------------------------------------------
export interface CentralStoreData {
  products: any[];
  storeHours: {
    openDays: string;
    openTime: string;
    closeTime: string;
    closedDaysInfo: string;
    timezone?: string;
  };
  storeSettings: {
    whatsappNumber: string;
    customQrImage?: string;
    storeName?: string;
  };
  orders: any[];
  templates: any[];
  updatedAt: string;
}

const DEFAULT_STORE_HOURS = {
  openDays: "Senin - Sabtu",
  openTime: "08:00",
  closeTime: "20:00",
  closedDaysInfo: "Minggu & Hari Libur Tutup",
  timezone: "WIB"
};

const DEFAULT_STORE_SETTINGS = {
  whatsappNumber: "0853-3949-9687",
  customQrImage: "",
  storeName: "vosprint"
};

const DEFAULT_INITIAL_ORDERS = [
  {
    id: 'INV-20260824-001',
    customerName: 'Budi Santoso',
    whatsapp: '081234567890',
    deliveryMethod: 'delivery',
    address: 'Jl. Merdeka No. 45, Jakarta Selatan',
    items: [
      {
        id: 'item-demo-1',
        productId: 'spanduk-flexi',
        productName: 'Spanduk / Banner Flexi',
        category: 'banner',
        pricingType: 'area',
        unit: 'm²',
        material: { id: 'flexi-340', name: 'Flexi High-Res 340gr', extraPrice: 10000 },
        width: 3,
        length: 1,
        finishing: [{ id: 'mata-ayam', name: 'Mata Ayam', price: 3000, isPerUnit: true, description: '' }],
        quantity: 2,
        designUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
        uploadedFileName: 'spanduk-grand-opening.pdf',
        fileQuality: 'high',
        notes: 'Mohon ring mata ayam diperkuat di tiap sudut.',
        subtotal: 198000
      }
    ],
    totalAmount: 198000,
    status: 'printing',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Pesanan dibuat oleh pelanggan' },
      { status: 'checking_file', timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), note: 'File desain disetujui & siap naik cetak' },
      { status: 'printing', timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), note: 'Sedang dalam proses mesin cetak' }
    ]
  },
  {
    id: 'INV-20260824-002',
    customerName: 'Siti Rahma',
    whatsapp: '085678901234',
    deliveryMethod: 'pickup',
    address: 'Ambil di Toko',
    items: [
      {
        id: 'item-demo-2',
        productId: 'stiker-chromo-vinyl',
        productName: 'Stiker Chromo / Vinyl A3+',
        category: 'stiker',
        pricingType: 'sheet',
        unit: 'lembar A3+',
        material: { id: 'vinyl-matte', name: 'Stiker Vinyl Matte (Doff)', extraPrice: 5000 },
        finishing: [{ id: 'kiss-cut', name: 'Kiss Cut', price: 3000, isPerUnit: true, description: '' }],
        quantity: 6,
        designUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
        uploadedFileName: 'label-sambal-mama.png',
        fileQuality: 'high',
        notes: 'Cutting bulat diameter 5cm',
        subtotal: 120000
      }
    ],
    totalAmount: 120000,
    status: 'checking_file',
    createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function loadStoreData(): CentralStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_DATA_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_DATA_FILE, "utf-8"));
      
      // Auto-merge any missing products from default PRODUCTS definition
      const existingProducts = Array.isArray(parsed.products) ? parsed.products : PRODUCTS;
      const missingProducts = PRODUCTS.filter(p => !existingProducts.some((ep: any) => ep.id === p.id));
      const mergedProducts = missingProducts.length > 0 ? [...existingProducts, ...missingProducts] : existingProducts;

      return {
        products: mergedProducts,
        storeHours: parsed.storeHours || DEFAULT_STORE_HOURS,
        storeSettings: parsed.storeSettings || DEFAULT_STORE_SETTINGS,
        orders: Array.isArray(parsed.orders) && parsed.orders.length > 0 ? parsed.orders : DEFAULT_INITIAL_ORDERS,
        templates: Array.isArray(parsed.templates) ? parsed.templates : [],
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch (err) {
    console.error("[StoreData] Error reading store data:", err);
  }

  const initialStore: CentralStoreData = {
    products: PRODUCTS,
    storeHours: DEFAULT_STORE_HOURS,
    storeSettings: DEFAULT_STORE_SETTINGS,
    orders: DEFAULT_INITIAL_ORDERS,
    templates: [],
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(STORE_DATA_FILE, JSON.stringify(initialStore, null, 2));
  } catch (err) {
    console.error("[StoreData] Error writing initial store data:", err);
  }

  return initialStore;
}

function saveStoreData(data: CentralStoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(STORE_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[StoreData] Error saving store data:", err);
  }
}

let centralStoreData = loadStoreData();

// Admin Authentication Middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : "";

  if (!token) {
    res.status(401).json({ success: false, message: "Akses ditolak: Token autentikasi admin tidak ditemukan." });
    return;
  }

  const check = verifySessionToken(token);
  if (!check.valid) {
    res.status(401).json({ success: false, message: "Akses ditolak: Sesi login admin telah kedaluwarsa atau tidak valid." });
    return;
  }

  next();
}

// -------------------------------------------------------------
// 3. MAIN SERVER ENTRYPOINT
// -------------------------------------------------------------
async function startServer() {
  const app = express();

  // Allow larger payload for custom product image / QR uploads (up to 15MB)
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Request IP Helper
  const getClientIp = (req: Request): string => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "127.0.0.1";
  };

  // -------------------------------------------------------------
  // API ROUTES: ADMIN AUTHENTICATION
  // -------------------------------------------------------------

  // 1. Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 2. Admin Login (POST /api/admin/login)
  app.post("/api/admin/login", (req: Request, res: Response) => {
    const { pin, clientId } = req.body;
    const ip = getClientIp(req);
    const identifier = clientId ? `client_${clientId}` : `ip_${ip}`;

    if (!pin || typeof pin !== "string") {
      res.status(400).json({ success: false, message: "PIN harus diisi." });
      return;
    }

    const now = Date.now();
    // Reload security store fresh from file to avoid stale in-memory state
    securityStore = loadSecurityStore();
    const attemptRecord = securityStore.failedAttempts[identifier] || { count: 0, lockedUntil: 0, lastAttempt: "" };

    if (attemptRecord.lockedUntil > now) {
      const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
      res.status(429).json({
        success: false,
        isBlocked: true,
        remainingAttempts: 0,
        message: `Akses login Moderator sedang diblokir karena salah PIN 3x. Coba lagi dalam ${remainingMinutes} menit.`
      });
      return;
    }

    const inputHash = hashPin(pin.trim(), securityStore.salt);
    let isValid = false;

    try {
      if (crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(securityStore.pinHash, "hex"))) {
        isValid = true;
      }
    } catch (e) {
      isValid = false;
    }

    // If still on default PIN, also accept standard default 2457 and configured default
    if (!isValid && (securityStore.isDefaultPin ?? true)) {
      const defaultOptions = ["2457", ADMIN_PIN_DEFAULT, "Delvos678"].filter(Boolean);
      if (defaultOptions.includes(pin.trim())) {
        isValid = true;
      }
    }

    if (isValid) {
      delete securityStore.failedAttempts[identifier];
      saveSecurityStore(securityStore);

      const token = generateSessionToken("moderator");
      res.json({
        success: true,
        token,
        role: "moderator",
        isDefaultPin: securityStore.isDefaultPin,
        message: "Login Admin Berhasil!"
      });
      return;
    }

    attemptRecord.count += 1;
    attemptRecord.lastAttempt = new Date().toISOString();

    const maxAttempts = 3;
    const remaining = Math.max(0, maxAttempts - attemptRecord.count);

    if (attemptRecord.count >= maxAttempts) {
      attemptRecord.lockedUntil = now + 15 * 60 * 1000;
      securityStore.failedAttempts[identifier] = attemptRecord;

      const deviceId = clientId || `PERANGKAT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBlockedRecord = {
        id: deviceId,
        ipAlias: `Sesi Browser (${ip})`,
        failedCount: attemptRecord.count,
        blockedAt: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
        isBlocked: true
      };

      securityStore.blockedDevices = [newBlockedRecord, ...securityStore.blockedDevices.filter(d => d.id !== deviceId)].slice(0, 20);
      saveSecurityStore(securityStore);

      res.status(403).json({
        success: false,
        isBlocked: true,
        remainingAttempts: 0,
        message: "PIN Salah 3x! Akses login Moderator diblokir selama 15 menit. Anda tetap dapat menggunakan website dalam Mode Spectator."
      });
      return;
    }

    securityStore.failedAttempts[identifier] = attemptRecord;
    saveSecurityStore(securityStore);

    res.status(401).json({
      success: false,
      isBlocked: false,
      remainingAttempts: remaining,
      message: `PIN Salah! Sisa percobaan login Moderator: ${remaining}x lagi.`
    });
  });

  // 3. Verify Admin Session Token (POST /api/admin/verify)
  app.post("/api/admin/verify", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : req.body.token;

    if (!token) {
      res.status(401).json({ valid: false, message: "Token tidak ditemukan." });
      return;
    }

    const verification = verifySessionToken(token);
    if (verification.valid) {
      res.json({
        valid: true,
        role: verification.role || "moderator",
        isDefaultPin: securityStore.isDefaultPin
      });
    } else {
      res.status(401).json({
        valid: false,
        expired: verification.expired ?? false,
        message: verification.expired ? "Sesi login telah kedaluwarsa. Silakan masukkan PIN kembali." : "Token tidak valid."
      });
    }
  });

  // 4. Reset Lockout (POST /api/admin/reset-lockout)
  app.post("/api/admin/reset-lockout", (req: Request, res: Response) => {
    const { clientId } = req.body;
    const ip = getClientIp(req);
    const identifier = clientId ? `client_${clientId}` : `ip_${ip}`;

    securityStore = loadSecurityStore();
    delete securityStore.failedAttempts[identifier];
    securityStore.blockedDevices = securityStore.blockedDevices.map(d => {
      if (d.id === clientId) return { ...d, isBlocked: false };
      return d;
    });
    saveSecurityStore(securityStore);

    res.json({
      success: true,
      message: "Status blokir berhasil di-reset. Anda dapat mencoba memasukkan PIN kembali."
    });
  });

  // 5. Change Admin PIN (POST /api/admin/change-pin)
  app.post("/api/admin/change-pin", (req: Request, res: Response) => {
    const { currentPin, newPin } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : "";

    let isAuthenticated = false;
    if (token) {
      const check = verifySessionToken(token);
      if (check.valid) isAuthenticated = true;
    }

    if (!isAuthenticated && currentPin) {
      const inputHash = hashPin(currentPin.trim(), securityStore.salt);
      try {
        if (crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(securityStore.pinHash, "hex"))) {
          isAuthenticated = true;
        }
      } catch (e) {}

      if (!isAuthenticated && (securityStore.isDefaultPin ?? true)) {
        const defaultOptions = ["2457", ADMIN_PIN_DEFAULT, "Delvos678"].filter(Boolean);
        if (defaultOptions.includes(currentPin.trim())) {
          isAuthenticated = true;
        }
      }
    }

    if (!isAuthenticated) {
      res.status(401).json({ success: false, message: "PIN Admin Saat Ini (Lama) tidak cocok atau sesi tidak valid." });
      return;
    }

    if (!newPin || typeof newPin !== "string" || newPin.trim().length < 4) {
      res.status(400).json({ success: false, message: "PIN Admin Baru minimal harus 4 karakter/digit." });
      return;
    }

    const newSalt = crypto.randomBytes(16).toString("hex");
    const newHash = hashPin(newPin.trim(), newSalt);

    securityStore.salt = newSalt;
    securityStore.pinHash = newHash;
    securityStore.updatedAt = new Date().toISOString();
    securityStore.isDefaultPin = false;
    saveSecurityStore(securityStore);

    const newToken = generateSessionToken("moderator");

    res.json({
      success: true,
      token: newToken,
      message: "PIN Keamanan Admin Berhasil Diperbarui dan di-hash aman di server!"
    });
  });

  // 5. Unblock Device (POST /api/admin/unblock)
  app.post("/api/admin/unblock", requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.body;

    securityStore.failedAttempts = {};
    if (id) {
      securityStore.blockedDevices = securityStore.blockedDevices.map(d => {
        if (d.id === id) return { ...d, isBlocked: false };
        return d;
      });
    } else {
      securityStore.blockedDevices = securityStore.blockedDevices.map(d => ({ ...d, isBlocked: false }));
    }
    saveSecurityStore(securityStore);

    res.json({
      success: true,
      message: "Akses perangkat berhasil dibuka kembali!",
      blockedDevices: securityStore.blockedDevices
    });
  });

  // 6. Security Overview (GET /api/admin/security-status)
  app.get("/api/admin/security-status", (req: Request, res: Response) => {
    res.json({
      success: true,
      isDefaultPin: securityStore.isDefaultPin,
      lastUpdated: securityStore.updatedAt,
      blockedCount: securityStore.blockedDevices.filter(d => d.isBlocked).length,
      blockedDevices: securityStore.blockedDevices,
      securityLevel: "HMAC-SHA256 & PBKDF2-SHA512 Server Protected"
    });
  });

  // 7. Admin Logout (POST /api/admin/logout)
  app.post("/api/admin/logout", (req: Request, res: Response) => {
    res.json({ success: true, message: "Berhasil keluar dari mode admin." });
  });

  // -------------------------------------------------------------
  // API ROUTES: CENTRALIZED STORE DATA (Products, Hours, Settings, Orders)
  // -------------------------------------------------------------

  // 8. Get All Centralized Store Data (Public)
  app.get("/api/store-data", (req: Request, res: Response) => {
    res.json({
      success: true,
      data: centralStoreData
    });
  });

  // 9. Get Products List (Public)
  app.get("/api/products", (req: Request, res: Response) => {
    res.json({
      success: true,
      products: centralStoreData.products,
      updatedAt: centralStoreData.updatedAt
    });
  });

  // 10. Update / Save Full Products List (Admin Only)
  app.post("/api/products", requireAdminAuth, (req: Request, res: Response) => {
    const { products } = req.body;
    if (!Array.isArray(products)) {
      res.status(400).json({ success: false, message: "Data produk harus berupa array." });
      return;
    }

    centralStoreData.products = products;
    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: "Katalog produk terpusat berhasil diperbarui di server!",
      products: centralStoreData.products,
      updatedAt: centralStoreData.updatedAt
    });
  });

  // 11. Update Single Product (Admin Only)
  app.post("/api/products/update", requireAdminAuth, (req: Request, res: Response) => {
    const { product } = req.body;
    if (!product || !product.id) {
      res.status(400).json({ success: false, message: "Data produk tidak lengkap." });
      return;
    }

    const existingIndex = centralStoreData.products.findIndex(p => p.id === product.id);
    if (existingIndex >= 0) {
      centralStoreData.products[existingIndex] = product;
    } else {
      centralStoreData.products.push(product);
    }
    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: `Produk "${product.name}" berhasil disimpan di server!`,
      products: centralStoreData.products,
      updatedAt: centralStoreData.updatedAt
    });
  });

  // 12. Delete Product (Admin Only)
  app.delete("/api/products/:id", requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    centralStoreData.products = centralStoreData.products.filter(p => p.id !== id);
    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: "Produk berhasil dihapus dari server!",
      products: centralStoreData.products,
      updatedAt: centralStoreData.updatedAt
    });
  });

  // 13. Update Store Hours (Admin Only)
  app.post("/api/store-hours", requireAdminAuth, (req: Request, res: Response) => {
    const { storeHours } = req.body;
    if (!storeHours) {
      res.status(400).json({ success: false, message: "Data jam toko tidak valid." });
      return;
    }

    centralStoreData.storeHours = storeHours;
    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: "Jam operasional toko berhasil diperbarui di server!",
      storeHours: centralStoreData.storeHours
    });
  });

  // 14. Update Store Settings (WhatsApp / QR) (Admin Only)
  app.post("/api/store-settings", requireAdminAuth, (req: Request, res: Response) => {
    const { storeSettings } = req.body;
    if (!storeSettings) {
      res.status(400).json({ success: false, message: "Pengaturan toko tidak valid." });
      return;
    }

    centralStoreData.storeSettings = {
      ...centralStoreData.storeSettings,
      ...storeSettings
    };
    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: "Pengaturan kontak & QR toko berhasil disimpan di server!",
      storeSettings: centralStoreData.storeSettings
    });
  });

  // 15. Create or Update Orders (Public for customer new order, Admin for status updates)
  app.post("/api/orders", (req: Request, res: Response) => {
    const { order } = req.body;
    if (!order || !order.id) {
      res.status(400).json({ success: false, message: "Data pesanan tidak lengkap." });
      return;
    }

    const existingIdx = centralStoreData.orders.findIndex(o => o.id === order.id);
    if (existingIdx >= 0) {
      centralStoreData.orders[existingIdx] = {
        ...centralStoreData.orders[existingIdx],
        ...order,
        updatedAt: new Date().toISOString()
      };
    } else {
      centralStoreData.orders.unshift(order);
    }

    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: "Pesanan berhasil dicatat di server!",
      order: existingIdx >= 0 ? centralStoreData.orders[existingIdx] : order,
      orders: centralStoreData.orders
    });
  });

  // 16. Update Order Status (Admin Only)
  app.post("/api/orders/:id/status", requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = centralStoreData.orders.find(o => o.id === id);
    if (!order) {
      res.status(404).json({ success: false, message: "Pesanan tidak ditemukan." });
      return;
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status diperbarui menjadi ${status}`
    });

    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: `Status pesanan ${id} berhasil diperbarui menjadi ${status}!`,
      order,
      orders: centralStoreData.orders
    });
  });

  // 17. Save Design Templates (Admin Only)
  app.post("/api/templates", requireAdminAuth, (req: Request, res: Response) => {
    const { templates } = req.body;
    if (!Array.isArray(templates)) {
      res.status(400).json({ success: false, message: "Data template harus berupa array." });
      return;
    }

    centralStoreData.templates = templates;
    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: "Template desain berhasil disinkronisasi ke server!",
      templates: centralStoreData.templates
    });
  });

  // 18. Reset Catalog to Default (Admin Only)
  app.post("/api/reset-catalog", requireAdminAuth, (req: Request, res: Response) => {
    centralStoreData.products = PRODUCTS;
    centralStoreData.storeHours = DEFAULT_STORE_HOURS;
    centralStoreData.storeSettings = DEFAULT_STORE_SETTINGS;
    saveStoreData(centralStoreData);

    res.json({
      success: true,
      message: "Katalog & Pengaturan Toko berhasil di-reset ke nilai bawaan pabrik!",
      products: centralStoreData.products,
      storeHours: centralStoreData.storeHours,
      storeSettings: centralStoreData.storeSettings
    });
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE (DEV) & STATIC SERVING (PROD)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VosPrint Server] Running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
