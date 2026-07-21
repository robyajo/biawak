import { env } from "../config/drizzle.js";
import {
  executeGenerateText,
  executeChat,
  executeStreamText,
  executeStreamChat,
  getProviderConfig,
  type AIOptions,
  type AIGenerateOptions,
  type AIChatOptions,
  type AIResponse,
  type AIMessage,
  type AIProviderName,
} from "./providers.js";

/**
 * Biawak AI Manager Class
 * Provides pre-configured, multi-model AI capabilities for Biawak applications.
 */
export class BiawakAIManager {
  /**
   * Checks if AI features are enabled in environment configuration.
   */
  get isEnabled(): boolean {
    return Boolean(env.AI_ENABLED);
  }

  /**
   * Returns current active provider configuration details.
   */
  getConfig(options?: AIOptions) {
    return getProviderConfig(options);
  }

  /**
   * Generates a text response from a single prompt.
   */
  async generateText(prompt: string | AIGenerateOptions, options?: AIOptions): Promise<AIResponse> {
    if (!this.isEnabled) {
      throw new Error("AI feature is disabled in .env (AI_ENABLED=false)");
    }
    if (typeof prompt === "string") {
      return executeGenerateText(prompt, options);
    }
    const { prompt: userPrompt, ...restOpts } = prompt;
    return executeGenerateText(userPrompt, { ...restOpts, ...options });
  }

  /**
   * Generates a multi-turn chat response from message history.
   */
  async chat(messages: AIMessage[] | AIChatOptions, options?: AIOptions): Promise<AIResponse> {
    if (!this.isEnabled) {
      throw new Error("AI feature is disabled in .env (AI_ENABLED=false)");
    }
    if (Array.isArray(messages)) {
      return executeChat(messages, options);
    }
    const { messages: chatMessages, ...restOpts } = messages;
    return executeChat(chatMessages, { ...restOpts, ...options });
  }

  /**
   * Streams a text response chunk by chunk for real-time streaming UI.
   */
  async *streamText(prompt: string | AIGenerateOptions, options?: AIOptions): AsyncGenerator<string> {
    if (!this.isEnabled) {
      throw new Error("AI feature is disabled in .env (AI_ENABLED=false)");
    }
    if (typeof prompt === "string") {
      yield* executeStreamText(prompt, options);
    } else {
      const { prompt: userPrompt, ...restOpts } = prompt;
      yield* executeStreamText(userPrompt, { ...restOpts, ...options });
    }
  }

  /**
   * Streams a multi-turn chat response chunk by chunk.
   */
  async *streamChat(messages: AIMessage[] | AIChatOptions, options?: AIOptions): AsyncGenerator<string> {
    if (!this.isEnabled) {
      throw new Error("AI feature is disabled in .env (AI_ENABLED=false)");
    }
    if (Array.isArray(messages)) {
      yield* executeStreamChat(messages, options);
    } else {
      const { messages: chatMessages, ...restOpts } = messages;
      yield* executeStreamChat(chatMessages, { ...restOpts, ...options });
    }
  }
}

/**
 * Singleton instance of Biawak AI pre-configured for framework usage.
 */
export const ai = new BiawakAIManager();
export {
  executeGenerateText,
  executeChat,
  executeStreamText,
  executeStreamChat,
  getProviderConfig,
  type AIOptions,
  type AIGenerateOptions,
  type AIChatOptions,
  type AIResponse,
  type AIMessage,
  type AIProviderName,
};
