---
name: release-docs
description: Otomatisasi penulisan dokumentasi website dan blog rilis untuk Biawak Framework berdasarkan analisis AI terhadap perubahan kode (fitur vs bug fix).
---

# 🦎 Auto Release Documentation Skill

Skill ini memberikan panduan penalaran otomatis bagi AI ketika melakukan rilis versi baru atau pembaruan kode pada Biawak Framework, agar konten website ([biawak.web.id](https://biawak.web.id)) di folder `website/src/content/docs/` selalu sinkron dan terupdate.

---

## 🎯 Aturan Penalaran AI (Decision Matrix)

Setiap kali terjadi rilis versi baru (`bun run release` / bump version) atau pembaruan kode, AI harus menganalisis perubahan (`git diff` / commit log) dan mengategorikannya:

### 1. 🚀 Kategori: Fitur Baru (`feat` / New Feature)
Apabila rilis mengandung fitur baru atau penambahan kemampuan framework:
- **Tindakan 1**: Buat atau perbarui berkas halaman dokumentasi panduan di `website/src/content/docs/<kategori>/<nama-fitur>.md`.
- **Tindakan 2**: Masukkan tautan panduan baru tersebut ke dalam `sidebar` di berkas `website/astro.config.mjs` jika halaman baru dibuat.
- **Tindakan 3**: Buat postingan catatan rilis di `website/src/content/docs/blog/vX-Y-Z.md`.
- **Tindakan 4**: Tambahkan/perbarui kartu fitur unggulan di halaman utama `website/src/content/docs/index.mdx` jika fitur tersebut merupakan keunggulan utama.

### 2. 🐛 Kategori: Perbaikan Bug / Patch (`fix` / Bug Fix / Refactor)
Apabila rilis hanya berisi perbaikan bug, refactoring, atau pengoptimalan internal:
- **Tindakan 1**: Buat/perbarui postingan catatan rilis di `website/src/content/docs/blog/vX-Y-Z.md` SAJA.
- **Tindakan 2**: **TIDAK PERLU** membuat halaman dokumentasi baru di folder lain agar navigasi dokumentasi utama tetap ringkas, bersih, dan fokus pada arsitektur utama.
