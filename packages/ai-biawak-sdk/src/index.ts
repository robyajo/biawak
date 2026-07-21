export type AIProviderName = "openai" | "gemini" | "anthropic" | "deepseek" | "ollama" | "custom";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface BiawakAIOptions {
  provider?: AIProviderName;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface BiawakAIClientOptions {
  /**
   * Optional base URL of Biawak Server (e.g., http://localhost:8000).
   * If provided, requests will be proxied through Biawak's /api/ai endpoints.
   */
  serverUrl?: string;

  /**
   * Default AI provider when calling direct AI providers
   */
  provider?: AIProviderName;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
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

export class BiawakAI {
  private config: BiawakAIClientOptions;

  constructor(options: BiawakAIClientOptions = {}) {
    this.config = options;
  }

  /**
   * Generates text from a single prompt.
   */
  async generateText(prompt: string, options?: BiawakAIOptions): Promise<AIResponse> {
    const opts = { ...this.config, ...options };

    if (this.config.serverUrl) {
      const res = await fetch(`${this.config.serverUrl.replace(/\/+$/, "")}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, ...opts }),
      });
      if (!res.ok) throw new Error(`[BiawakAI Server] Request failed with status ${res.status}`);
      const json: any = await res.json();
      return json.data;
    }

    // Direct multi-provider call
    return this.executeDirectChat([{ role: "user", content: prompt }], opts);
  }

  /**
   * Generates a chat response from message history.
   */
  async chat(messages: AIMessage[], options?: BiawakAIOptions): Promise<AIResponse> {
    const opts = { ...this.config, ...options };

    if (this.config.serverUrl) {
      const res = await fetch(`${this.config.serverUrl.replace(/\/+$/, "")}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, ...opts }),
      });
      if (!res.ok) throw new Error(`[BiawakAI Server] Request failed with status ${res.status}`);
      const json: any = await res.json();
      return json.data;
    }

    return this.executeDirectChat(messages, opts);
  }

  /**
   * Streams text response tokens in real-time.
   */
  async *streamText(prompt: string, options?: BiawakAIOptions): AsyncGenerator<string> {
    const opts = { ...this.config, ...options };

    if (this.config.serverUrl) {
      const res = await fetch(`${this.config.serverUrl.replace(/\/+$/, "")}/api/ai/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, ...opts }),
      });

      if (!res.ok || !res.body) throw new Error(`[BiawakAI Server Stream] Request failed: ${res.status}`);

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
          if (trimmed === "data: [DONE]") return;
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.substring(6));
              if (json.chunk) yield json.chunk;
            } catch {}
          }
        }
      }
      return;
    }

    yield* this.executeDirectStreamChat([{ role: "user", content: prompt }], opts);
  }

  private async executeDirectChat(messages: AIMessage[], opts: BiawakAIOptions): Promise<AIResponse> {
    const provider = opts.provider || "openai";
    const apiKey = opts.apiKey || "";
    const baseUrl = opts.baseUrl || (provider === "openai" ? "https://api.openai.com/v1" : "http://localhost:11434");
    const model = opts.model || (provider === "openai" ? "gpt-4o-mini" : "llama3");

    const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: opts.system ? [{ role: "system", content: opts.system }, ...messages] : messages,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Direct AI Request failed (${res.status}): ${err}`);
    }

    const data: any = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || "",
      provider,
      model,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }

  private async *executeDirectStreamChat(messages: AIMessage[], opts: BiawakAIOptions): AsyncGenerator<string> {
    const provider = opts.provider || "openai";
    const apiKey = opts.apiKey || "";
    const baseUrl = opts.baseUrl || (provider === "openai" ? "https://api.openai.com/v1" : "http://localhost:11434");
    const model = opts.model || (provider === "openai" ? "gpt-4o-mini" : "llama3");

    const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: opts.system ? [{ role: "system", content: opts.system }, ...messages] : messages,
        stream: true,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok || !res.body) throw new Error(`Direct AI Stream failed (${res.status})`);

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
  }
}

export function createBiawakAI(options?: BiawakAIClientOptions): BiawakAI {
  return new BiawakAI(options);
}
