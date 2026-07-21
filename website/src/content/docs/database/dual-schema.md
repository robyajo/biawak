---
title: Strategi Dual-Schema (SQLite & MySQL)
description: Bagaimana Biawak menggunakan Drizzle ORM untuk mendukung SQLite pada tahap development dan MySQL di tahap produksi secara seamless.
---

Salah satu keunggulan utama Biawak adalah **Strategi Dual-Schema**. Anda dapat melakukan pengembangan secara lokal tanpa setup database tambahan menggunakan file-based **SQLite**, dan bertransisi ke database enterprise **MySQL** di server produksi cukup dengan mengubah konfigurasi `.env`.

---

## ⚡ Pembuatan Dual-Schema via CLI
Gunakan perintah pembuat skema tabel otomatis berikut:
```bash
bun run make schema product
```
*Hasil*: Membuat dua berkas struktur tabel database secara paralel:
1. `src/db/schema/sqlite/product.ts` (Untuk database lokal dev)
2. `src/db/schema/mysql/product.ts` (Untuk database produksi)

---

## ⚙️ Bagaimana Dual-Schema Berjalan?

Drizzle ORM memiliki dialek query SQL yang berbeda untuk SQLite dan MySQL. Biawak mengatasi perbedaan ini dengan membuat skema tabel kembar.

### 🧩 1. Contoh Skema SQLite (`src/db/schema/sqlite/product.ts`):
```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
});
```

### 🧩 2. Contoh Skema MySQL (`src/db/schema/mysql/product.ts`):
```typescript
import { mysqlTable, varchar, int } from "drizzle-orm/mysql-core";

export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: int("price").notNull(),
});
```

### 🔗 3. Penyatuan Impor Skema (`src/db/schema/index.ts`):
Semua skema tabel diimpor secara kondisional berdasarkan driver database aktif (`DB_DRIVER` di berkas `.env`) sehingga aplikasi Hono Anda hanya perlu mengimpor dari berkas indeks tunggal:

```typescript
import { sqliteSchema } from "./sqlite/index.js";
import { mysqlSchema } from "./mysql/index.js";
import dotenv from "dotenv";

dotenv.config();

const isMySQL = process.env.DB_DRIVER === "mysql";

// Mengekspor skema yang sesuai secara otomatis!
export const schema = isMySQL ? mysqlSchema : sqliteSchema;
```

Dengan arsitektur penyatuan ini, query Drizzle di dalam aplikasi Anda tetap seragam tanpa perlu mengkhawatirkan perbedaan database di belakang layar:
```typescript
import { db } from "../config/drizzle.js";
import { products } from "../db/schema/index.js";

// Query ini otomatis mengeksekusi dialek SQL yang sesuai!
const allProducts = await db.select().from(products);
```
