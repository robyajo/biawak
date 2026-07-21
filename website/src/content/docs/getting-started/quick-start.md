---
title: Pengenalan & Instalasi Cepat
description: Cara memulai proyek baru menggunakan Biawak Framework dan CLI create-biawak-app.
---

Selamat datang di **Biawak Framework**! 🦎

Biawak dirancang khusus untuk pengembang yang membutuhkan kecepatan **Bun** dan **Hono** tanpa harus menghabiskan waktu berjam-jam mengkonfigurasi autentikasi, ORM database, atau skrip deployment.

---

## ⚡ Instalasi Cepat via CLI Initializer

Anda dapat membuat proyek baru dalam waktu kurang dari 10 detik menggunakan Bun atau NPX:

```bash
# Menggunakan Bun (Direkomendasikan)
bun create biawak-app@latest my-app

# Atau menggunakan NPX
npx create-biawak-app@latest my-app
```

### 🧙 Wizard Instalasi Otomatis
Wizard CLI akan secara otomatis:
1. Menyalin berkas templat proyek **Biawak**.
2. Menginstall dependensi proyek via `bun install`.
3. Menginisialisasi database file-based **SQLite** (`sqlite.db`) dan menjalankan `db:push`.
4. Melakukan seeding data awal untuk akun Admin (`admin@gmail.com`) dan User (`user@gmail.com`).

---

## 🛠️ Menjalankan Server Development

Masuk ke direktori proyek yang baru dibuat, lalu jalankan:

```bash
cd my-app
bun run dev
```

Server akan langsung aktif di **`http://localhost:8000`**.

### Access Portal & Documentation:
- 🌐 **Developer Portal**: [http://localhost:8000/](http://localhost:8000/)
- 📖 **Interactive Manual Book**: [http://localhost:8000/manual-book](http://localhost:8000/manual-book)
- 📄 **Swagger UI**: [http://localhost:8000/api/doc](http://localhost:8000/api/doc)
- 🔍 **OpenAPI 3.0 JSON**: [http://localhost:8000/api/openapi](http://localhost:8000/api/openapi)
