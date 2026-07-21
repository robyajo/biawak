import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import type { Hono } from "hono";
import { env } from "../config/drizzle.js";
import { logger } from "./logger.js";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

export { websocket };

/**
 * Registers WebSocket routes on Hono app if WS_ENABLED=true in .env
 */
export function setupWebSocketRoutes(app: Hono<any>): void {
  if (!env.WS_ENABLED) {
    return;
  }

  const wsPath = env.WS_PATH || "/ws";

  app.get(
    wsPath,
    upgradeWebSocket(() => ({
      onOpen(_evt, ws) {
        logger.info("📡 [WebSocket] Client connected!");
        ws.send(
          JSON.stringify({
            event: "connected",
            message: "Connected to Hono + Bun WebSocket server!",
            timestamp: new Date().toISOString(),
          }),
        );
      },
      async onMessage(evt, ws) {
        logger.info(`📡 [WebSocket] Message received: ${evt.data}`);
        let parsedData: any = evt.data;
        try {
          parsedData = JSON.parse(String(evt.data));
        } catch {
          parsedData = { event: "ping", data: String(evt.data) };
        }

        const eventName = parsedData?.event;
        const requestId = parsedData?.id || `req_${Date.now()}`;
        const payload = parsedData?.data || parsedData;

        // AI Streaming Event Handler over WebSocket
        if (eventName === "ai:chat" || eventName === "ai:stream") {
          try {
            const { ai } = await import("../ai/index.js");
            if (!ai.isEnabled) {
              ws.send(JSON.stringify({ event: "ai:error", id: requestId, error: "AI feature is disabled on server." }));
              return;
            }

            const prompt = payload.prompt;
            const messages = payload.messages;
            const options = {
              system: payload.system,
              provider: payload.provider,
              model: payload.model,
              temperature: payload.temperature,
              maxTokens: payload.maxTokens,
            };

            let generator;
            if (messages && Array.isArray(messages)) {
              generator = ai.streamChat(messages, options);
            } else if (prompt) {
              generator = ai.streamText(prompt, options);
            } else {
              ws.send(JSON.stringify({ event: "ai:error", id: requestId, error: "Prompt or messages required." }));
              return;
            }

            for await (const token of generator) {
              ws.send(
                JSON.stringify({
                  event: "ai:token",
                  id: requestId,
                  token,
                  timestamp: new Date().toISOString(),
                }),
              );
            }

            ws.send(
              JSON.stringify({
                event: "ai:done",
                id: requestId,
                timestamp: new Date().toISOString(),
              }),
            );
          } catch (err: any) {
            logger.error("📡 [WebSocket AI Error]", { error: err });
            ws.send(
              JSON.stringify({
                event: "ai:error",
                id: requestId,
                error: err.message || "AI stream error",
              }),
            );
          }
          return;
        }

        // Echo back message with timestamp for standard events
        ws.send(
          JSON.stringify({
            event: "message_ack",
            received: parsedData,
            timestamp: new Date().toISOString(),
          }),
        );
      },
      onClose() {
        logger.info("📡 [WebSocket] Client disconnected.");
      },
      onError(evt) {
        logger.error("📡 [WebSocket] Connection error", { error: evt as any });
      },
    })),
  );

  logger.info(`✅ WebSocket server mounted on path: ${wsPath}`);
}
