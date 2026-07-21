---
title: Sistem Middleware & Keamanan
description: Panduan arsitektur middleware kustom, autentikasi, serta penanganan error global di Biawak Framework.
---

Middleware merupakan komponen krusial di dalam Biawak yang berjalan di antara HTTP Request dan Route Handler. Biawak dilengkapi dengan middleware bawaan untuk Logging, Global Error Handling, Autentikasi, dan pembatasan hak akses.

---

## ⚡ Pembuatan Middleware Baru via CLI
Gunakan perintah CLI berikut untuk membuat file template middleware kosong secara otomatis:
```bash
bun run make middleware rateLimit
```
*Hasil*: Membuat berkas baru di `src/middleware/ratelimit.ts`.

---

## 🔒 Autentikasi & Otorisasi Akses

Biawak terintegrasi erat dengan **Better-Auth** untuk otentikasi berbasis token/session yang aman.

### 1. Memproteksi Route (`auth` middleware)
Untuk memastikan endpoint hanya dapat diakses oleh user yang sudah masuk/terotentikasi, pasang middleware `auth`:

```typescript
import { Hono } from "hono";
import { auth } from "../middleware/auth.js";

const securedRouter = new Hono();

// Seluruh handler di bawah router ini wajib membawa token otentikasi
securedRouter.use("*", auth);

securedRouter.get("/profile", (c) => {
  const user = c.get("user"); // Mendapatkan data user aktif dari context Hono
  return c.json({ success: true, user });
});
```

### 2. Membatasi Akses Khusus Admin (`ensureAdmin`)
Biawak memisahkan otorisasi peran menggunakan peran administrator. Gunakan `ensureAdmin` setelah middleware `auth`:

```typescript
import { Hono } from "hono";
import { auth } from "../middleware/auth.js";
import { ensureAdmin } from "../middleware/ensureAdmin.js";

const adminRouter = new Hono();

// Wajib Login DAN memiliki role "admin"
adminRouter.use("*", auth, ensureAdmin);

adminRouter.get("/dashboard-stats", (c) => {
  return c.json({ success: true, totalRevenue: 150000000 });
});
```

---

## 🚨 Penanganan Error Global (`errorHandler`)
Biawak membungkus seluruh aplikasi dengan middleware `errorHandler` terpusat. Ketika aplikasi mengalami error tak terduga atau crash di route mana pun, sistem secara otomatis menangkapnya dan mengirimkan respon JSON 500 yang rapi ke pengguna:

```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": "Detail pesan error hanya muncul pada mode development"
}
```

Hal ini menjamin integritas keamanan aplikasi Anda agar tidak membocorkan stack trace sensitif di lingkungan produksi (*production*).
