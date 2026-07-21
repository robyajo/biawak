---
title: "🤖 Integrasi Multi-Model AI Framework"
description: "Panduan lengkap penggunaan fitur AI terkonfigurasi pada Biawak Framework mendukung OpenAI, Gemini, Anthropic, DeepSeek, Ollama, dan Custom endpoints."
---

Biawak Framework menyediakan modul **AI Engine** bawaan yang terkonfigurasi secara terpusat melalui berkas `.env`. Anda tidak perlu memasang SDK tambahan atau menulis adapter HTTP secara manual untuk menggunakan model kecerdasan buatan.

---

## ⚙️ Konfigurasi `.env`

Cukup aktifkan fitur AI dan masukkan provider serta API Key pada berkas `.env` aplikasi Anda:

```ini
# Multi-Provider AI Configuration
# Providers: openai | gemini | anthropic | deepseek | ollama | custom
AI_ENABLED=true
AI_PROVIDER=openai
AI_API_KEY=your_openai_api_key
AI_MODEL=gpt-4o-mini
AI_BASE_URL=

# Fallback Provider Keys (Opsional)
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
```

---

## 🚀 Penggunaan `ai` Helper di Server

Import helper `ai` langsung dalam route atau service Biawak:

```typescript
import { ai } from "../ai/index.js";

// 1. Text Generation Sederhana
const res = await ai.generateText("Jelaskan manfaat arsitektur Bun + Hono.");
console.log(res.text);

// 2. Multi-turn Chat
const chatRes = await ai.chat([
  { role: "system", content: "Anda adalah asisten virtual profesional." },
  { role: "user", content: "Bagaimana cara membuat REST API cepat?" }
]);
console.log(chatRes.text);

// 3. Switch Provider Dynamic saat runtime
const geminiRes = await ai.generateText("Halo Gemini!", {
  provider: "gemini",
  model: "gemini-1.5-flash"
});
```

---

## 📡 Ready-to-Use REST API Endpoints

Biawak Framework secara otomatis menyediakan REST API endpoint untuk kebutuhan aplikasi Anda:

### 1. `POST /api/ai/chat` (JSON Response)
Mengirimkan prompt atau pesan chat dan menerima balasan dalam bentuk JSON lengkap.

```json
// Request Body
{
  "prompt": "Tuliskan ringkasan 1 paragraf tentang TypeScript.",
  "provider": "openai",
  "temperature": 0.7
}
```

### 2. `POST /api/ai/stream` (SSE Real-Time Stream)
Streaming token kata demi kata secara real-time menggunakan standar **Server-Sent Events (SSE)**.

```bash
curl -X POST http://localhost:8000/api/ai/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Buatkan fungsi binary search di Bun TS"}'
```

### 3. `GET /api/ai/models`
Mengembalikan status keaktifan AI, provider default, serta daftar provider yang didukung.

---

## 🌐 Real-Time AI over WebSocket

Biawak menyatukan AI Engine dengan sistem WebSocket server bawaan. Client aplikasi dapat mendengarkan streaming token AI secara instan melalui WebSocket event `ai:stream`.
