---
title: Alur Kerja Migrasi & Seeding
description: Cara mengelola perubahan skema database (drizzle-kit) dan mengisi data awal (seeding) di Biawak Framework.
---

Biawak menggunakan **Drizzle Kit** untuk mengotomatiskan pembuatan berkas SQL migrasi dari kode skema TypeScript Anda, serta mendukung script seeding data awal untuk mengisi data database secara cepat.

---

## 🚀 Perintah Migrasi Database

Biawak memetakan perintah Drizzle Kit ke dalam perintah package manager yang mudah digunakan:

### 1. Prototyping Cepat (`db:push`)
Untuk memperbarui struktur database lokal Anda secara instan selama tahap pengembangan tanpa perlu membuat berkas SQL migrasi:
```bash
bun run db:push
```
*Kegunaan*: Sangat direkomendasikan saat membuat skema tabel baru secara lokal agar database SQLite Anda langsung sinkron.

### 2. Membuat SQL Migrasi (`db:generate`)
Jika Anda melakukan perubahan skema dan ingin mendokumentasikannya ke dalam bentuk berkas SQL migrasi terstruktur (biasanya untuk staging/produksi):
```bash
bun run db:generate
```
*Hasil*: Membuat berkas migrasi `.sql` baru di folder `src/db/drizzle/sqlite` atau `src/db/drizzle/mysql` tergantung driver aktif.

### 3. Menjalankan Migrasi Produksi (`db:migrate`)
Gunakan perintah ini untuk mengeksekusi seluruh berkas SQL migrasi yang belum terpasang ke database target:
```bash
bun run db:migrate
```

---

## 🌱 Mengisi Data Awal (`db:seed`)

Setelah membuat tabel, Anda memerlukan data awal (seperti data akun user default, konfigurasi sistem, atau kategori barang).

### Menjalankan Seeding
Jalankan perintah ini untuk mengeksekusi script seeder bawaan Biawak:
```bash
bun run db:seed
```
*Hasil*: Menambahkan akun bawaan berikut ke database Anda:
- 👑 **Admin**: `admin@gmail.com` dengan password `Password123`
- 👤 **User**: `user@gmail.com` dengan password `Password123`

### Menulis Seeder Kustom (`src/db/seed.ts`)
Anda dapat menambahkan data awal tambahan dengan memodifikasi berkas [seed.ts](file:///e:/PROJECT%20ROBY/BIAWAK/biawak/src/db/seed.ts):

```typescript
import { db } from "../config/drizzle.js";
import { products } from "./schema/index.js";

async function main() {
  console.log("🌱 Menjalankan seeder kustom...");
  
  await db.insert(products).values([
    { id: "p1", name: "Kopi Gayo", price: 35000 },
    { id: "p2", name: "Teh Matcha", price: 28000 }
  ]);
  
  console.log("✅ Seeding selesai!");
}

main().catch(console.error);
```

---

## 🔄 Mereset Database (`db:reset`)
Jika database lokal Anda sudah terlalu kotor dan Anda ingin membersihkan seluruh isi tabel serta mengulangi seeding dari nol, cukup jalankan:
```bash
bun run db:reset
```
*Tindakan*: Menghapus berkas SQLite lokal, membuat ulang database bersih, dan otomatis melakukan seeding ulang.
