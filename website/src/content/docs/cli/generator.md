---
title: Biawak CLI Tools (Make & Upgrade)
description: Panduan lengkap penggunaan generator kode otomatis (make) dan asisten pembaruan dependensi (upgrade) pada Biawak Framework.
---

Biawak menyediakan seperangkat alat CLI untuk mempercepat siklus pengembangan Anda, mulai dari generator kode terisolasi hingga asisten pembaruan framework otomatis.

---

## 🛠️ Biawak Code Generator (`make`)

Utilitas pembuat kode otomatis ini terisolasi di dalam `node_modules` (`bin/biawak-make.js`) agar tidak mengotori repositori proyek Anda dengan berkas skrip tambahan.

### 📋 Menampilkan Daftar Generator
Cukup jalankan perintah berikut tanpa argumen untuk menampilkan semua generator kode yang tersedia beserta fungsinya:

<div class="terminal-window">
  <div class="terminal-topbar">
    <div class="mac-dots">
      <span class="mac-dot dot-close"></span>
      <span class="mac-dot dot-min"></span>
      <span class="mac-dot dot-max"></span>
    </div>
    <span class="terminal-path">bash — bun run make</span>
    <span class="w-[52px]"></span>
  </div>
  <div class="terminal-content">
    <div class="t-line">
      <span class="t-prompt">~/my-app ❯ </span>
      <span class="t-cmd">bun run make</span>
    </div>
    <div class="t-line" style="color: #60a5fa; font-weight: bold; margin-top: 0.5rem;">
      🦎 Biawak Code Generator CLI
    </div>
    <div class="t-line" style="font-weight: bold; margin-top: 0.5rem; color: #ffffff;">
      Usage:
    </div>
    <div class="t-line">
      &nbsp;&nbsp;<span class="t-cmd">bun run make route</span> &lt;name&gt;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="t-dim">Create a new Hono API route</span>
    </div>
    <div class="t-line">
      &nbsp;&nbsp;<span class="t-cmd">bun run make middleware</span> &lt;name&gt;&nbsp;&nbsp;<span class="t-dim">Create a new custom middleware</span>
    </div>
    <div class="t-line">
      &nbsp;&nbsp;<span class="t-cmd">bun run make schema</span> &lt;name&gt;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="t-dim">Create a new DB schema for SQLite & MySQL</span>
    </div>
  </div>
</div>

---

### 1. Membuat Route API Baru
Gunakan perintah ini untuk membuat berkas router Hono baru:

```bash
# Sintaks baru
bun run make route product

# Sintaks alternatif
bun run make:route product
```
* **Hasil**: Membuat berkas `src/routes/product.ts` yang berisi templat router Hono lengkap, terintegrasi dengan OpenAPI (`describeRoute`), skema Zod resolver, dan tipe respons.

---

### 2. Membuat Middleware Baru
Gunakan perintah ini untuk membuat middleware kustom Hono:

```bash
# Sintaks baru
bun run make middleware rateLimit

# Sintaks alternatif
bun run make:middleware rateLimit
```
* **Hasil**: Membuat berkas `src/middleware/ratelimit.ts` yang berisi boiler plate penanganan siklus *request* dan *next response*.

---

### 3. Membuat Dual-Schema Database Baru
Gunakan perintah ini untuk membuat skema tabel database Drizzle:

```bash
# Sintaks baru
bun run make schema product

# Sintaks alternatif
bun run make:schema product
```
* **Hasil**: Membuat dua berkas skema database Drizzle secara bersamaan untuk SQLite (untuk dev) dan MySQL (untuk production):
  - `src/db/schema/sqlite/product.ts`
  - `src/db/schema/mysql/product.ts`

---

## 🔄 Biawak Upgrade Assistant (`upgrade`)

Saat framework Biawak memperbarui struktur atau versi dependensi penting, Anda dapat memutakhirkan proyek Anda dengan aman menggunakan asisten pembaruan otomatis:

```bash
bun run upgrade
```

:::important[Keamanan Upgrade]
Asisten ini hanya menyelaraskan modul inti framework pada `package.json` dan memicu `bun install` ulang untuk mengunduh modul terbaru. Kode kustom, database, `.env`, dan dependensi buatan Anda sendiri **dijamin aman dan tidak akan disentuh atau dihapus**.
:::
