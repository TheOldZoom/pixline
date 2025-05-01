import { Node } from "../interfaces/INode";
import WebSocket from "ws";

export default class NodeConnection {
  public options: Node;
  public ws?: WebSocket;
  public isAlive: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(options: Node) {
    this.options = options;
    this.connect();
  }

  public connect() {
    const { identifier, port, ssl, secret_key } = this.options;
    const protocol = ssl ? "wss" : "ws";
    const url = `${protocol}://${identifier}:${port}`;

    this.ws = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${secret_key}`,
      },
    });

    this.ws.on("open", () => {
      console.log(`[${identifier}] Connected.`);
      this.isAlive = true;
      this.startHealthCheck();
    });

    this.ws.on("close", () => {
      console.warn(`[${identifier}] Connection closed.`);
      this.isAlive = false;
      this.stopHealthCheck();
    });

    this.ws.on("error", (err) => {
      console.error(`[${identifier}] Error:`, err.message);
      this.isAlive = false;
    });
  }

  private startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.warn(`[${this.options.identifier}] WebSocket not open.`);
        this.isAlive = false;
      } else {
        console.log(`[${this.options.identifier}] WebSocket alive.`);
        this.isAlive = true;
      }
    }, 30_000);
  }

  private stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  public disconnect() {
    this.stopHealthCheck();
    this.ws?.close();
  }
}
