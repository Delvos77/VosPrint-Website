import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const PORT = 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || "vosprint-secure-default-session-secret-2026-super-key";
const ADMIN_PIN_DEFAULT = process.env.ADMIN_PIN_DEFAULT || "2457";
const ADMIN_PIN_PEPPER = process.env.ADMIN_PIN_PEPPER || "vosprint-pepper-secret-random-salt-2026";

// -------------------------------------------------------------
// SECURE PASSWORD / PIN HASHING UTILITIES (Node.js native Crypto)
// -------------------------------------------------------------
interface SecurityStore {
  pinHash: string;
  salt: string;
  updatedAt: string;
  isDefaultPin: boolean;
  failedAttempts: Record<string, { count: number; lockedUntil: number; lastAttempt: string }>;
  blockedDevices: Array<{ id: string; ipAlias: string; failedCount: number; blockedAt: string; isBlocked: boolean }>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SECURITY_FILE = path.join(DATA_DIR, "admin-security.json");

function hashPin(pin: string, salt: string): string {
  // Combine PIN + PEPPER with PBKDF2 (10,000 iterations SHA-512)
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

// In-memory runtime state synchronized with file
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

    // Expiration check: 24 hours (86,400,000 ms)
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
// MAIN SERVER ENTRYPOINT
// -------------------------------------------------------------
async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request IP Helper
  const getClientIp = (req: Request): string => {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.socket.remoteAddress || "127.0.0.1";
  };

  // -------------------------------------------------------------
  // API ROUTES: ADMIN AUTHENTICATION & SECURITY
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
    const attemptRecord = securityStore.failedAttempts[identifier] || { count: 0, lockedUntil: 0, lastAttempt: "" };

    // Check if temporarily or permanently locked out (>= 3 attempts)
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

    // Verify PIN against stored hash
    const inputHash = hashPin(pin.trim(), securityStore.salt);
    const isValid = crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(securityStore.pinHash, "hex"));

    if (isValid) {
      // Reset failed attempts on success
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

    // Failed attempt handling
    attemptRecord.count += 1;
    attemptRecord.lastAttempt = new Date().toISOString();

    const maxAttempts = 3;
    const remaining = Math.max(0, maxAttempts - attemptRecord.count);

    if (attemptRecord.count >= maxAttempts) {
      // Lockout for 15 minutes
      attemptRecord.lockedUntil = now + 15 * 60 * 1000;
      securityStore.failedAttempts[identifier] = attemptRecord;

      // Add to blocked devices record for admin audit log
      const deviceId = clientId || `PERANGKAT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBlockedRecord = {
        id: deviceId,
        ipAlias: `Sesi Browser (${ip})`,
        failedCount: attemptRecord.count,
        blockedAt: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
        isBlocked: true
      };

      // Keep recent 20 entries
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

  // 4. Change Admin PIN (POST /api/admin/change-pin)
  app.post("/api/admin/change-pin", (req: Request, res: Response) => {
    const { currentPin, newPin } = req.body;
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : "";

    // Verify authentication via active token OR via correct current PIN
    let isAuthenticated = false;
    if (token) {
      const check = verifySessionToken(token);
      if (check.valid) isAuthenticated = true;
    }

    if (!isAuthenticated && currentPin) {
      const inputHash = hashPin(currentPin.trim(), securityStore.salt);
      if (crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(securityStore.pinHash, "hex"))) {
        isAuthenticated = true;
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

    // Generate fresh salt and new hash for the new PIN
    const newSalt = crypto.randomBytes(16).toString("hex");
    const newHash = hashPin(newPin.trim(), newSalt);

    securityStore.salt = newSalt;
    securityStore.pinHash = newHash;
    securityStore.updatedAt = new Date().toISOString();
    securityStore.isDefaultPin = false;
    saveSecurityStore(securityStore);

    // Issue a refreshed token
    const newToken = generateSessionToken("moderator");

    res.json({
      success: true,
      token: newToken,
      message: "PIN Keamanan Admin Berhasil Diperbarui dan di-hash aman di server!"
    });
  });

  // 5. Unblock Device (POST /api/admin/unblock)
  app.post("/api/admin/unblock", (req: Request, res: Response) => {
    const { id } = req.body;

    // Reset attempts in memory
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
