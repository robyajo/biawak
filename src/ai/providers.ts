import { env } from "../config/drizzle.js";

export type AIProviderName = "openai" | "gemini" | "anthropic" | "deepseek" | "ollama" | "custom";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIOptions {
  provider?: AIProviderName;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerateOptions extends AIOptions {
  prompt: string;
}

export interface AIChatOptions extends AIOptions {
  messages: AIMessage[];
}

export interface AIResponse {
  text: string;
  provider: AIProviderName;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Resolves API Key and Base URL based on provider & env configurations.
 */
export function getProviderConfig(options?: AIOptions) {
  const provider = (options?.provider || env.AI_PROVIDER || "openai") as AIProviderName;
  let apiKey = options?.apiKey || env.AI_API_KEY || "";
  let baseUrl = options?.baseUrl || env.AI_BASE_URL || "";
  let defaultModel = options?.model || env.AI_MODEL || "";

  switch (provider) {
    case "openai":
      if (!apiKey) apiKey = env.OPENAI_API_KEY || "";
      if (!baseUrl) baseUrl = "https://api.openai.com/v1";
      if (!defaultModel) defaultModel = "gpt-4o-mini";
      break;

    case "gemini":
      if (!apiKey) apiKey = env.GEMINI_API_KEY || "";
      if (!baseUrl) baseUrl = "https://generativelanguage.googleapis.com/v1beta";
      if (!defaultModel) defaultModel = "gemini-1.5-flash";
      break;

    case "anthropic":
      if (!apiKey) apiKey = env.ANTHROPIC_API_KEY || "";
      if (!baseUrl) baseUrl = "https://api.anthropic.com/v1";
      if (!defaultModel) defaultModel = "claude-3-5-sonnet-20241022";
      break;

    case "deepseek":
      if (!apiKey) apiKey = env.DEEPSEEK_API_KEY || "";
      if (!baseUrl) baseUrl = "https://api.deepseek.com/v1";
      if (!defaultModel) defaultModel = "deepseek-chat";
      break;

    case "ollama":
      if (!baseUrl) baseUrl = env.OLLAMA_BASE_URL || "http://localhost:11434";
      if (!defaultModel) defaultModel = "llama3";
      break;

    case "custom":
      if (!baseUrl) baseUrl = env.AI_BASE_URL || "http://localhost:8000/v1";
      if (!defaultModel) defaultModel = "default-model";
      break;
  }

  return { provider, apiKey, baseUrl, model: defaultModel };
}

/**
 * Executes a non-streaming AI completion across supported providers.
 */
export async function executeGenerateText(prompt: string, options?: AIOptions): Promise<AIResponse> {
  const cfg = getProviderConfig(options);
  const messages: AIMessage[] = [];
  if (options?.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: prompt });

  return executeChat(messages, { ...options, provider: cfg.provider, model: cfg.model });
}

/**
 * Executes a non-streaming multi-turn chat across supported providers.
 */
export async function executeChat(messages: AIMessage[], options?: AIOptions): Promise<AIResponse> {
  const cfg = getProviderConfig(options);
  const temp = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens;

  // 1. OpenAI / DeepSeek / Custom (OpenAI-compatible)
  if (cfg.provider === "openai" || cfg.provider === "deepseek" || cfg.provider === "custom") {
    const url = `${cfg.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: temp,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[AI Provider ${cfg.provider}] Request failed (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || "",
      provider: cfg.provider,
      model: cfg.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }

  // 2. Gemini
  if (cfg.provider === "gemini") {
    const url = `${cfg.baseUrl.replace(/\/+$/, "")}/models/${cfg.model}:generateContent?key=${cfg.apiKey}`;
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find((m) => m.role === "system")?.content || options?.system;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        generationConfig: {
          temperature: temp,
          ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[AI Provider Gemini] Request failed (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: any) => p.text).join("") || "";

    return {
      text,
      provider: "gemini",
      model: cfg.model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount,
        completionTokens: data.usageMetadata?.candidatesTokenCount,
        totalTokens: data.usageMetadata?.totalTokenCount,
      },
    };
  }

  // 3. Anthropic
  if (cfg.provider === "anthropic") {
    const url = `${cfg.baseUrl.replace(/\/+$/, "")}/messages`;
    const systemPrompt = messages.find((m) => m.role === "system")?.content || options?.system;
    const anthropicMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: anthropicMessages,
        max_tokens: maxTokens || 1024,
        temperature: temp,
        ...(systemPrompt ? { system: systemPrompt } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[AI Provider Anthropic] Request failed (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    const text = data.content?.map((c: any) => c.text).join("") || "";

    return {
      text,
      provider: "anthropic",
      model: cfg.model,
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }

  // 4. Ollama
  if (cfg.provider === "ollama") {
    const url = `${cfg.baseUrl.replace(/\/+$/, "")}/api/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        stream: false,
        options: {
          temperature: temp,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`[AI Provider Ollama] Request failed (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return {
      text: data.message?.content || "",
      provider: "ollama",
      model: cfg.model,
    };
  }

  throw new Error(`Unsupported AI Provider: ${cfg.provider}`);
}

/**
 * Executes a streaming text completion yielding text chunks in real-time.
 */
export async function* executeStreamText(prompt: string, options?: AIOptions): AsyncGenerator<string> {
  const cfg = getProviderConfig(options);
  const messages: AIMessage[] = [];
  if (options?.system) {
    messages.push({ role: "system", content: options.system });
  }
  messages.push({ role: "user", content: prompt });

  yield* executeStreamChat(messages, options);
}

/**
 * Executes a streaming chat completion yielding text chunks in real-time.
 */
export async function* executeStreamChat(messages: AIMessage[], options?: AIOptions): AsyncGenerator<string> {
  const cfg = getProviderConfig(options);
  const temp = options?.temperature ?? 0.7;
  const maxTokens = options?.maxTokens;

  // 1. OpenAI / DeepSeek / Custom (OpenAI SSE standard format)
  if (cfg.provider === "openai" || cfg.provider === "deepseek" || cfg.provider === "custom") {
    const url = `${cfg.baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        temperature: temp,
        stream: true,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text();
      throw new Error(`[AI Stream ${cfg.provider}] Request failed (${res.status}): ${errText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (trimmed === "data: [DONE]") return;
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.substring(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) yield delta;
          } catch {}
        }
      }
    }
    return;
  }

  // 2. Gemini Stream
  if (cfg.provider === "gemini") {
    const url = `${cfg.baseUrl.replace(/\/+$/, "")}/models/${cfg.model}:streamGenerateContent?key=${cfg.apiKey}&alt=sse`;
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const systemInstruction = messages.find((m) => m.role === "system")?.content || options?.system;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
        generationConfig: {
          temperature: temp,
          ...(maxTokens ? { maxOutputTokens: maxTokens } : {}),
        },
      }),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text();
      throw new Error(`[AI Stream Gemini] Request failed (${res.status}): ${errText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.substring(6));
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch {}
        }
      }
    }
    return;
  }

  // 3. Ollama Stream
  if (cfg.provider === "ollama") {
    const url = `${cfg.baseUrl.replace(/\/+$/, "")}/api/chat`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.model,
        messages,
        stream: true,
      }),
    });

    if (!res.ok || !res.body) {
      const errText = await res.text();
      throw new Error(`[AI Stream Ollama] Request failed (${res.status}): ${errText}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          try {
            const json = JSON.parse(trimmed);
            if (json.message?.content) yield json.message.content;
          } catch {}
        }
      }
    }
    return;
  }

  // Fallback for non-streaming providers: execute chat then yield result
  const result = await executeChat(messages, options);
  yield result.text;
}
