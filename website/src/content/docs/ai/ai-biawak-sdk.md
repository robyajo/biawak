---
title: "📦 Paket NPM `ai-biawak-sdk`"
description: "Dokumentasi paket npm ai-biawak-sdk untuk integrasi multi-provider AI di Node.js, Bun, dan Browser."
---

Paket `ai-biawak-sdk` adalah pustaka JavaScript/TypeScript universal yang mempermudah integrasi AI multi-model pada aplikasi client maupun server.

---

## 💻 Instalasi via NPM / Bun

```bash
# Gunakan NPM
npm install ai-biawak-sdk

# Atau gunakan Bun
bun add ai-biawak-sdk
```

---

## ⚡ Mode Penggunaan

### Mode 1: Server Proxy (Terhubung dengan Biawak Backend)

Gunakan mode ini jika Anda mengintegrasikan frontend web dengan backend Biawak yang sudah terkonfigurasi API key-nya.

```typescript
import { createBiawakAI } from "ai-biawak-sdk";

const ai = createBiawakAI({
  serverUrl: "http://localhost:8000"
});

// Non-streaming chat
const res = await ai.generateText("Apa itu Biawak Framework?");
console.log(res.text);

// Real-time Text Streaming
for await (const token of ai.streamText("Tuliskan contoh route Hono.")) {
  process.stdout.write(token);
}
```

---

### Mode 2: Direct Provider API Call

Gunakan mode ini jika aplikasi Node/Bun Anda ingin langsung menghubungi LLM Provider tanpa melalui backend Biawak.

```typescript
import { BiawakAI } from "ai-biawak-sdk";

const ai = new BiawakAI();

// Mengakses Gemini AI langsung
const response = await ai.generateText("Jelaskan teknologi kecerdasan buatan.", {
  provider: "gemini",
  apiKey: "AIzaSy...",
  model: "gemini-1.5-flash"
});

console.log(response.text);
```
