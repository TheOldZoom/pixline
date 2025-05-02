import WebSocket from "ws";
import Logger from "./Logger";
import { Node, NodeStatus } from "../prisma/.client";
import Prisma from "../utils/db/Prisma";

export default class NodeConnection {
  public options: Node;
  public ws?: WebSocket;
  public isAlive = false;
  private hasDisconnected = false; // <== add this
  private healthCheckInterval?: NodeJS.Timeout;
  private logger = new Logger({ appName: "Node" });

  constructor(options: Node) {
    this.options = options;
    this.connect();
  }

  private async setStatus(status: NodeStatus) {
    try {
      await Prisma.node.updateMany({
        where: { id: this.options.id },
        data: { status },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update status to ${status}: ${(error as Error).message}`
      );
    }
  }

  private async handleDisconnect(reason: string) {
    if (this.hasDisconnected) return;
    this.hasDisconnected = true;

    this.logger.warn(
      `[${this.options.identifier}:${this.options.port}] ${reason}`
    );
    this.isAlive = false;
    await this.setStatus(NodeStatus.OFFLINE);
  }

  public connect() {
    const { identifier, port, ssl, secret_key } = this.options;
    const protocol = ssl ? "wss" : "ws";
    const url = `${protocol}://${identifier}:${port}`;

    this.ws = new WebSocket(url, {
      headers: { Authorization: `Bearer ${secret_key}` },
    });

    this.ws.on("open", async () => {
      this.logger.info(`[${identifier}:${port}] Connected.`);
      this.isAlive = true;
      this.hasDisconnected = false;
      this.startHealthCheck();
      await this.setStatus(NodeStatus.ONLINE);
    });

    this.ws.on("close", async () => {
      await this.handleDisconnect("Connection closed.");
    });

    this.ws.on("error", async (err) => {
      await this.handleDisconnect("Connection error.");
    });
  }

  private startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.logger.warn(`[${this.options.identifier}] WebSocket not open.`);
        this.isAlive = false;
        await this.setStatus(NodeStatus.OFFLINE);
      } else {
        this.logger.debug(`[${this.options.identifier}] WebSocket alive.`);
        this.isAlive = true;
        await this.setStatus(NodeStatus.ONLINE);
      }
    }, 30_000);
  }

  private stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
  }

  public async disconnect() {
    this.stopHealthCheck();
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    if (!this.hasDisconnected) {
      await this.setStatus(NodeStatus.OFFLINE);
      this.logger.info(`[${this.options.identifier}] Disconnected.`);
    }
    this.hasDisconnected = true;
  }
}
