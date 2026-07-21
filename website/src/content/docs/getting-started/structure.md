---
title: Struktur Direktori Proyek
description: Panduan tata letak folder dan arsitektur kode di dalam Biawak Framework.
---

Biawak menggunakan struktur folder modular yang terorganisir dengan sangat rapi untuk memisahkan logika API, konfigurasi database, middleware, serta utilitas pembantu.

---

## 📂 Struktur Folder Utama

Berikut adalah pohon direktori dari proyek Biawak baru Anda:

```text
my-app/
├── bin/                  # CLI tools pembantu (diabaikan saat rilis/copy)
├── src/
│   ├── ai/               # Integrasi API Provider (OpenAI, Gemini, etc)
│   ├── config/           # Konfigurasi ORM dan database
│   ├── db/               # Migrasi schema dan seed data
│   │   ├── drizzle/      # SQL migrasi otomatis dari drizzle-kit
│   │   ├── schema/       # Struktur tabel SQLite & MySQL
│   │   └── seed.ts       # Script seeding data bawaan
│   ├── html/             # File static untuk dev portal & manual book
│   ├── lib/              # Pustaka utilitas (WebSocket, Logger, Queue)
│   ├── middleware/       # Middleware kustom (Auth, Error, Logger)
│   ├── routes/           # Router Hono API modular
│   └── index.ts          # Entry point utama aplikasi
├── tests/                # Unit testing dengan Bun Test
├── .env.example          # Contoh variabel lingkungan
├── package.json          # Manajemen dependensi dan script
└── tsconfig.json         # Konfigurasi compiler TypeScript
```

---

## 💡 Fungsi Utama Tiap Direktori

### 1. `src/routes/`
Tempat Anda menulis semua endpoint RESTful API. Setiap modul (misalnya `auth.ts`, `ai.ts`) dipisahkan ke berkas router Hono masing-masing, kemudian di-mount secara kolektif di `src/routes/index.ts`.

### 2. `src/db/`
Mengelola seluruh interaksi database menggunakan Drizzle ORM:
- **`schema/`**: Berisi deklarasi skema tabel kustom terpisah untuk SQLite (pengembangan) dan MySQL (produksi).
- **`seed.ts`**: Script untuk mengisi data awal (seperti admin default) ke dalam database secara otomatis saat proyek pertama kali dibuat.

### 3. `src/middleware/`
Menyimpan middleware Hono kustom untuk validasi dan pengamanan HTTP request:
- `auth.ts`: Melakukan intercept token autentikasi.
- `ensureAdmin.ts`: Validasi hak akses khusus administrator.
- `errorHandler.ts`: Penangkap error global untuk menjamin respon JSON yang bersih.

### 4. `src/lib/`
Kumpulan modul utilitas modular berkinerja tinggi, termasuk logger berbasis file, queue antrean BullMQ, dan inisialisator server WebSocket.
