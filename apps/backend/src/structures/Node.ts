import WebSocket from "ws";
import Logger from "./Logger";
import { Node } from "../prisma/.client";

export default class NodeConnection {
  public options: Node;
  public ws?: WebSocket;
  public isAlive: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;
  private logger: Logger = new Logger({ appName: "Node" });

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
      this.logger.info(`[${identifier}:${port}] Connected.`);
      this.isAlive = true;
      this.startHealthCheck();
    });

    this.ws.on("close", () => {
      this.logger.warn(`[${identifier}:${port}] Connection closed.`);
      this.isAlive = false;
      this.stopHealthCheck();
    });

    this.ws.on("error", (err) => {
      this.logger.error(`[${identifier}:${port}] Error: ${err.message}`);
      this.isAlive = false;
    });
  }

  private startHealthCheck() {
    this.healthCheckInterval = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.logger.warn(`[${this.options.identifier}] WebSocket not open.`);
        this.isAlive = false;
      } else {
        this.logger.debug(`[${this.options.identifier}] WebSocket alive.`);
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
