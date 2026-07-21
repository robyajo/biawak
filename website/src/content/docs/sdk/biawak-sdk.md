---
title: "⚡ Paket NPM `biawak-sdk` (WebSocket Client)"
description: "Dokumentasi paket npm biawak-sdk untuk koneksi WebSocket real-time, auto-reconnect, dan real-time AI streaming di sisi client."
---

`biawak-sdk` adalah client SDK resmi untuk aplikasi frontend (React, Vue, Svelte, Angular, Vanilla JS) dan Node.js/Bun yang perlu terhubung ke fitur komunikasi real-time WebSocket Biawak Framework.

---

## 💻 Instalasi via NPM / Bun

```bash
# Gunakan NPM
npm install biawak-sdk

# Atau gunakan Bun
bun add biawak-sdk
```

---

## 🚀 Fitur & Penggunaan

### 1. Inisialisasi Koneksi & Auto-Reconnect

```typescript
import { createBiawakClient } from "biawak-sdk";

const client = createBiawakClient({
  url: "ws://localhost:8000/ws",
  reconnect: true,
  maxReconnectAttempts: 5
});

client.on("connected", (info) => {
  console.log("🟢 Terhubung ke WebSocket Biawak:", info.url);
});

client.on("disconnected", () => {
  console.log("🔴 Koneksi terputus.");
});

client.on("reconnecting", (info) => {
  console.log(`🟡 Mencoba menghubungkan ulang... (Percobaan ke-${info.attempt})`);
});
```

---

### 2. Mengirim & Menerima Custom Event (Pub/Sub)

```typescript
// Mendengarkan event dari server
client.on("notification:new", (data) => {
  console.log("Notifikasi baru:", data.message);
});

// Mengirim event ke server
client.send("chat:send", {
  roomId: "room-1",
  text: "Halo teman-teman!"
});
```

---

### 3. Real-Time AI Streaming over WebSocket 🤖

Dengan `streamAI()`, Anda dapat melakukan streaming teks balasan AI secara instan langsung melalui koneksi WebSocket yang sudah terbuka tanpa perlu membuat koneksi HTTP SSE terpisah.

```typescript
const cancelStream = client.streamAI(
  {
    prompt: "Jelaskan konsep WebSocket dalam 3 poin utama.",
    provider: "openai",
    model: "gpt-4o-mini"
  },
  {
    onToken: (token) => {
      // Dipanggil setiap kali token kata baru diterima dari server
      process.stdout.write(token);
    },
    onComplete: (fullText) => {
      console.log("\n✅ AI Respon selesai disajikan!");
    },
    onError: (err) => {
      console.error("❌ Terjadi kesalahan pada AI Stream:", err.message);
    }
  }
);

// Untuk membatalkan streaming secara manual:
// cancelStream();
```
