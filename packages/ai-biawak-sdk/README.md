# 🤖 `ai-biawak-sdk`

SDK Resmi Multi-Provider AI Integration untuk Biawak Framework & Node.js/Bun applications.

## 📦 Instalasi

```bash
# via NPM
npm install ai-biawak-sdk

# via Bun
bun add ai-biawak-sdk
```

## 🚀 Fitur Utama

- **Multi-Model Support**: OpenAI (`gpt-4o-mini`, `gpt-4o`), Google Gemini (`gemini-1.5-flash`), Anthropic (`claude-3-5-sonnet`), DeepSeek (`deepseek-chat`), Ollama Local AI (`llama3`), & Custom OpenAI-compatible endpoints.
- **Server Proxy Mode**: Otomatis terhubung dengan endpoint `/api/ai/chat` & `/api/ai/stream` pada server Biawak.
- **Direct Mode**: Dapat digunakan langsung di client/server dengan API Key masing-masing provider.
- **Real-time Streaming**: Mendukung AsyncGenerator token-by-token text streaming.

## 💡 Contoh Penggunaan

### 1. Mode Server Proxy Biawak
```typescript
import { createBiawakAI } from "ai-biawak-sdk";

const ai = createBiawakAI({
  serverUrl: "http://localhost:8000"
});

// Non-streaming chat
const res = await ai.generateText("Jelaskan fitur utama Biawak Framework dalam 2 kalimat.");
console.log(res.text);

// Real-time Streaming
for await (const chunk of ai.streamText("Tuliskan kode Hello World dalam Bun.")) {
  process.stdout.write(chunk);
}
```

### 2. Mode Direct Provider API
```typescript
import { BiawakAI } from "ai-biawak-sdk";

const ai = new BiawakAI();

const res = await ai.generateText("Halo AI!", {
  provider: "gemini",
  apiKey: "YOUR_GEMINI_API_KEY",
  model: "gemini-1.5-flash"
});

console.log(res.text);
```
