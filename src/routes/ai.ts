import { Hono } from "hono";
import { ai } from "../ai/index.js";
import { logger } from "../lib/logger.js";

const aiRouter = new Hono();

/**
 * GET /api/ai/models
 * Get information on active AI provider and model settings.
 */
aiRouter.get("/models", (c) => {
  if (!ai.isEnabled) {
    return c.json({ enabled: false, message: "AI features are disabled." });
  }

  const activeConfig = ai.getConfig();
  return c.json({
    enabled: true,
    provider: activeConfig.provider,
    model: activeConfig.model,
    baseUrl: activeConfig.baseUrl,
    availableProviders: ["openai", "gemini", "anthropic", "deepseek", "ollama", "custom"],
  });
});

/**
 * POST /api/ai/chat
 * Non-streaming chat / completion request
 */
aiRouter.post("/chat", async (c) => {
  if (!ai.isEnabled) {
    return c.json({ error: "Forbidden", message: "AI features are disabled in server configuration." }, 403);
  }

  try {
    const body = await c.req.json();
    const { prompt, messages, system, provider, model, temperature, maxTokens } = body;

    if (!prompt && (!messages || !Array.isArray(messages))) {
      return c.json({ error: "BadRequest", message: "Either 'prompt' or 'messages' array is required." }, 400);
    }

    let response;
    if (messages && Array.isArray(messages)) {
      response = await ai.chat(messages, { system, provider, model, temperature, maxTokens });
    } else {
      response = await ai.generateText(prompt, { system, provider, model, temperature, maxTokens });
    }

    return c.json({
      success: true,
      data: response,
    });
  } catch (err: any) {
    logger.error("❌ [AI API Error]", { error: err });
    return c.json({ error: "AIError", message: err.message || "AI request failed." }, 500);
  }
});

/**
 * POST /api/ai/stream
 * Real-time Server-Sent Events (SSE) streaming endpoint
 */
aiRouter.post("/stream", async (c) => {
  if (!ai.isEnabled) {
    return c.json({ error: "Forbidden", message: "AI features are disabled in server configuration." }, 403);
  }

  try {
    const body = await c.req.json();
    const { prompt, messages, system, provider, model, temperature, maxTokens } = body;

    if (!prompt && (!messages || !Array.isArray(messages))) {
      return c.json({ error: "BadRequest", message: "Either 'prompt' or 'messages' array is required." }, 400);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          let generator;
          if (messages && Array.isArray(messages)) {
            generator = ai.streamChat(messages, { system, provider, model, temperature, maxTokens });
          } else {
            generator = ai.streamText(prompt, { system, provider, model, temperature, maxTokens });
          }

          for await (const chunk of generator) {
            const sseData = `data: ${JSON.stringify({ chunk })}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err: any) {
          logger.error("❌ [AI Stream Error]", { error: err });
          const errData = `data: ${JSON.stringify({ error: err.message })}\n\n`;
          controller.enqueue(encoder.encode(errData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return c.json({ error: "AIError", message: err.message || "AI streaming failed." }, 500);
  }
});

export default aiRouter;
