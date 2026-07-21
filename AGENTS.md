# Biawak Project AI Rules & Release Documentation Policy

## 🦎 Release Documentation & Content Automation Rules

Setiap kali melakukan pembaruan versi, rilis baru, atau modifikasi fitur/bug fix pada Biawak Framework:

1. **Analisis Perubahan (AI Reasoning)**:
   - Evaluasi diff kode dan commit log untuk menentukan tipe perubahan: **Fitur Baru (`feat`)** atau **Perbaikan Bug (`fix`)**.

2. **Aturan Rilis Fitur Baru (`feat`)**:
   - Wajib menambahkan/memperbarui halaman dokumentasi di `website/src/content/docs/<kategori>/<nama-fitur>.md`.
   - Wajib mendaftarkan halaman dokumentasi baru tersebut ke dalam `sidebar` di `website/astro.config.mjs`.
   - Wajib membuat catatan rilis blog baru di `website/src/content/docs/blog/vX-Y-Z.md`.

3. **Aturan Rilis Bug Fix (`fix`)**:
   - Cukup buat/perbarui catatan rilis blog di `website/src/content/docs/blog/vX-Y-Z.md` yang menjelaskan bug yang diperbaiki.
   - Dilarang membuat halaman dokumentasi panduan baru jika hanya perbaikan bug/patch kecil.

4. **Karakteristik & Estetika Website**:
   - Seluruh halaman website dokumentasi wajib menggunakan mode **Light Mode Only** dengan estetika modern (*clean slate*, aksen hijau emerald `#10b981`).
