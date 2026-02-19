/**
 * Lightweight STOMP 1.2 client over WebSocket.
 * Only implements CONNECT, SUBSCRIBE, SEND, and DISCONNECT —
 * just enough for the mentor handover flow.
 */

const WS_URL = "wss://ai.chatbot.zaha.tech/chatbot-ai/ws";
const HEARTBEAT = "4000,4000";

type MessageHandler = (body: string, headers: Record<string, string>) => void;

export class StompClient {
  private ws: WebSocket | null = null;
  private connected = false;
  private subscriptions = new Map<string, MessageHandler>();
  private subCounter = 0;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;

  connect(onConnect?: () => void, onDisconnect?: () => void) {
    this.onConnectCallback = onConnect ?? null;
    this.onDisconnectCallback = onDisconnect ?? null;

    this.ws = new WebSocket(WS_URL, ["v12.stomp"]);

    this.ws.onopen = () => {
      this.sendFrame("CONNECT", {
        "accept-version": "1.2,1.1,1.0",
        "heart-beat": HEARTBEAT,
      });
    };

    this.ws.onmessage = (event) => {
      const data = typeof event.data === "string" ? event.data : "";
      this.handleFrame(data);
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.onDisconnectCallback?.();
    };

    this.ws.onerror = () => {
      this.connected = false;
    };
  }

  disconnect() {
    if (this.connected && this.ws) {
      this.sendFrame("DISCONNECT", {});
    }
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.subscriptions.clear();
  }

  subscribe(destination: string, handler: MessageHandler): string {
    const id = `sub-${this.subCounter++}`;
    this.subscriptions.set(id, handler);
    if (this.connected) {
      this.sendFrame("SUBSCRIBE", { id, destination });
    }
    return id;
  }

  send(destination: string, body: string) {
    if (!this.connected) return;
    this.sendFrame(
      "SEND",
      {
        destination,
        "content-length": String(new TextEncoder().encode(body).length),
      },
      body,
    );
  }

  isConnected() {
    return this.connected;
  }

  private sendFrame(
    command: string,
    headers: Record<string, string>,
    body?: string,
  ) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    let frame = command + "\n";
    for (const [key, value] of Object.entries(headers)) {
      frame += `${key}:${value}\n`;
    }
    frame += "\n";
    if (body) frame += body;
    frame += "\0";
    this.ws.send(frame);
  }

  private handleFrame(raw: string) {
    const nullIdx = raw.indexOf("\0");
    const frame = nullIdx >= 0 ? raw.substring(0, nullIdx) : raw;

    const firstNewline = frame.indexOf("\n");
    if (firstNewline < 0) return;

    const command = frame.substring(0, firstNewline).trim();
    const rest = frame.substring(firstNewline + 1);

    // Split headers from body (empty line separates them)
    const headerEndIdx = rest.indexOf("\n\n");
    const headersStr =
      headerEndIdx >= 0 ? rest.substring(0, headerEndIdx) : rest;
    const body = headerEndIdx >= 0 ? rest.substring(headerEndIdx + 2) : "";

    const headers: Record<string, string> = {};
    for (const line of headersStr.split("\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        headers[line.substring(0, colonIdx).trim()] = line
          .substring(colonIdx + 1)
          .trim();
      }
    }

    switch (command) {
      case "CONNECTED":
        this.connected = true;
        this.onConnectCallback?.();
        break;

      case "MESSAGE": {
        const subId = headers["subscription"];
        const handler = subId ? this.subscriptions.get(subId) : undefined;
        handler?.(body, headers);
        break;
      }

      case "ERROR":
        this.connected = false;
        break;
    }
  }
}
