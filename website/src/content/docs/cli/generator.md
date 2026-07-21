---
title: Biawak Code Generator (make)
description: Panduan pembuatan Route, Middleware, dan Schema otomatis menggunakan Biawak CLI.
---

Biawak menyediakan utilitas pembuat kode otomatis yang terisolasi di dalam `node_modules` (`bin/biawak-make.js`). Utilitas ini mempermudah pembuatan berkas baru tanpa mengotori repositori proyek Anda dengan skrip tambahan.

---

## 🛠️ Perintah Generator CLI

### 1. Membuat Route API Baru (`make:route`)
```bash
bun run make:route product
```
*Hasil*: Membuat berkas `src/routes/product.ts` yang berisi templat router Hono lengkap dengan dokumentasi OpenAPI (`describeRoute`) dan skema Zod.

### 2. Membuat Middleware Kustom (`make:middleware`)
```bash
bun run make:route rateLimit
```
*Hasil*: Membuat berkas `src/middleware/ratelimit.ts` yang berisi templat middleware Hono.

### 3. Membuat Dual-Schema Drizzle (`make:schema`)
```bash
bun run make:schema product
```
*Hasil*: Membuat dua berkas skema secara otomatis untuk SQLite & MySQL:
- `src/db/schema/sqlite/product.ts`
- `src/db/schema/mysql/product.ts`
