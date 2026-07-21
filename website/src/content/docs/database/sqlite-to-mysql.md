---
title: Zero-Config SQLite → Production MySQL
description: Cara beralih driver database dari SQLite ke MySQL pada Biawak Framework.
---

Biawak Framework hadir dengan arsitektur **Dual-Database Driver** yang fleksibel. Secara default, Biawak berjalan menggunakan **SQLite** agar pengembang dapat langsung bekerja tanpa perlu menginstall database server eksternal.

---

## 🗄️ Mode SQLite (Zero-Config Default)

Secara bawaan di berkas `.env`:

```ini
DB_DRIVER=sqlite
DB_FILE_NAME=sqlite.db
```

Pada mode ini, data akan disimpan ke dalam berkas `sqlite.db` di root proyek menggunakan driver bawaan Bun (`bun:sqlite`).

---

## 🐬 Mode MySQL (Production Ready)

Saat siap untuk tahap produksi atau membutuhkan database relasional berskala besar, Anda cukup mengubah konfigurasi di berkas `.env`:

```ini
DB_DRIVER=mysql
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=biawak
DB_HOST=127.0.0.1
DB_PORT=3306
```

### Sinkronisasi Skema MySQL:
Setelah mengubah driver ke `mysql`, jalankan perintah berikut untuk membuat tabel dan data awal di server MySQL Anda:

```bash
# Push skema Drizzle langsung ke database MySQL
bun run db:push

# Seed data awal Admin, User, dan Sosial Media
bun run db:seed
```
