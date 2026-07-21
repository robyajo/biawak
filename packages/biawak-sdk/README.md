# 🦎 `biawak-sdk`

Client SDK Resmi untuk Koneksi WebSocket Real-Time, Pub/Sub Event, & Real-Time AI Streaming pada Biawak Framework.

## 📦 Instalasi

```bash
# via NPM
npm install biawak-sdk

# via Bun
bun add biawak-sdk
```

## 🚀 Fitur Utama

- **Zero Dependency**: Berjalan di browser (React, Vue, Svelte, Vanilla JS) dan Node.js/Bun runtime.
- **Auto Reconnect**: Sistem penanganan koneksi putus-sambung otomatis dengan exponential backoff strategy.
- **Event Pub/Sub**: Mengirim dan mendengarkan custom real-time event dengan API sederhana (`on`, `off`, `send`).
- **Real-Time AI Streaming over WebSocket**: Menerima streaming token AI secara instan langsung melalui WebSocket tanpa overhead HTTP SSE.

## 💡 Contoh Penggunaan

### 1. Koneksi WebSocket & Pub/Sub Event
```typescript
import { createBiawakClient } from "biawak-sdk";

const client = createBiawakClient({
  url: "ws://localhost:8000/ws",
  reconnect: true
});

client.on("connected", () => {
  console.log("📡 Connected to Biawak WebSocket Server!");
});

client.on("chat:message", (data) => {
  console.log("Pesan baru:", data);
});

// Kirim event ke server
client.send("chat:send", { text: "Halo semuanya!" });
```

### 2. Streaming AI Real-Time over WebSocket
```typescript
import { BiawakClient } from "biawak-sdk";

const client = new BiawakClient({ url: "ws://localhost:8000/ws" });

const cancelStream = client.streamAI(
  {
    prompt: "Buatkan puisi singkat tentang Biawak Framework.",
    provider: "openai",
    model: "gpt-4o-mini"
  },
  {
    onToken: (token) => {
      process.stdout.write(token); // Tampilkan token real-time
    },
    onComplete: (fullText) => {
      console.log("\n✅ Streaming selesai!");
    },
    onError: (err) => {
      console.error("❌ Error AI:", err.message);
    }
  }
);
```
