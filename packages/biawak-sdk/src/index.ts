export interface BiawakClientOptions {
  /**
   * WebSocket server URL (e.g., ws://localhost:8000/ws or wss://api.example.com/ws)
   */
  url?: string;
  /**
   * Automatically connect on instantiation (default: true)
   */
  autoConnect?: boolean;
  /**
   * Automatically attempt to reconnect when disconnected (default: true)
   */
  reconnect?: boolean;
  /**
   * Maximum reconnection attempts (default: 10)
   */
  maxReconnectAttempts?: number;
  /**
   * Base reconnection delay in ms (default: 1000)
   */
  reconnectDelay?: number;
}

export interface StreamAICallbacks {
  onToken?: (token: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export interface StreamAIPayload {
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  system?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

type EventHandler = (data: any) => void;

export class BiawakClient {
  private url: string;
  private ws: any = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private shouldReconnect: boolean;
  private isConnecting = false;

  constructor(options: BiawakClientOptions = {}) {
    this.url = options.url || "ws://localhost:8000/ws";
    this.shouldReconnect = options.reconnect ?? true;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.reconnectDelay = options.reconnectDelay ?? 1000;

    if (options.autoConnect !== false) {
      this.connect();
    }
  }

  /**
   * Connects to the Biawak WebSocket Server
   */
  connect(): void {
    if (this.ws || this.isConnecting) return;

    this.isConnecting = true;
    try {
      const g = globalThis as any;
      const WebSocketClass = g.WebSocket || g.window?.WebSocket;
      if (!WebSocketClass) {
        throw new Error("WebSocket is not supported in this environment.");
      }

      const socket = new WebSocketClass(this.url);
      this.ws = socket;

      socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emitLocal("connected", { url: this.url, timestamp: new Date().toISOString() });
      };

      socket.onmessage = (event: { data: any }) => {
        try {
          const parsed = JSON.parse(event.data);
          const eventName = parsed.event;
          if (eventName) {
            this.emitLocal(eventName, parsed);
          } else {
            this.emitLocal("message", parsed);
          }
        } catch {
          this.emitLocal("raw", event.data);
        }
      };

      socket.onclose = () => {
        this.isConnecting = false;
        this.ws = null;
        this.emitLocal("disconnected", { timestamp: new Date().toISOString() });

        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const timeout = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
          this.emitLocal("reconnecting", { attempt: this.reconnectAttempts, timeout });
          setTimeout(() => this.connect(), timeout);
        }
      };

      socket.onerror = (err: any) => {
        this.isConnecting = false;
        this.emitLocal("error", err);
      };
    } catch (err: any) {
      this.isConnecting = false;
      this.emitLocal("error", err);
    }
  }

  /**
   * Disconnects from the WebSocket Server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Sends an event to the server
   */
  send(event: string, data: any = {}, id?: string): void {
    if (!this.ws || this.ws.readyState !== 1) {
      throw new Error("WebSocket is not connected. Call connect() first.");
    }
    const message = JSON.stringify({
      event,
      id: id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      data,
      timestamp: new Date().toISOString(),
    });
    this.ws.send(message);
  }

  /**
   * Subscribe to client events (server events, connection events, AI tokens)
   */
  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from client events
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Helper for real-time AI streaming over WebSocket
   */
  streamAI(payload: StreamAIPayload, callbacks: StreamAICallbacks = {}): () => void {
    const requestId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let accumulatedText = "";

    const onToken = (data: any) => {
      if (data.id === requestId && data.token) {
        accumulatedText += data.token;
        if (callbacks.onToken) callbacks.onToken(data.token);
      }
    };

    const onDone = (data: any) => {
      if (data.id === requestId) {
        cleanup();
        if (callbacks.onComplete) callbacks.onComplete(accumulatedText);
      }
    };

    const onError = (data: any) => {
      if (data.id === requestId) {
        cleanup();
        if (callbacks.onError) callbacks.onError(new Error(data.error || "AI stream error"));
      }
    };

    const cleanup = () => {
      this.off("ai:token", onToken);
      this.off("ai:done", onDone);
      this.off("ai:error", onError);
    };

    this.on("ai:token", onToken);
    this.on("ai:done", onDone);
    this.on("ai:error", onError);

    this.send("ai:stream", payload, requestId);

    // Returns cancel/cleanup function
    return cleanup;
  }

  private emitLocal(event: string, data: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((h) => {
        try {
          h(data);
        } catch (e) {
          console.error(`[BiawakClient] Error in listener for '${event}':`, e);
        }
      });
    }
  }
}

export function createBiawakClient(options?: BiawakClientOptions): BiawakClient {
  return new BiawakClient(options);
}
