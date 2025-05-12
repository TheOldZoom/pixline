import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import Logger from "./Logger";

interface WebSocketHandlerOptions {
  wss: WebSocketServer;
  logger: Logger;
}

export default class WebSocketHandler {
  private wss: WebSocketServer;
  private logger: Logger;
  private activeConnections: Map<string, WebSocket> = new Map();

  constructor({ wss, logger }: WebSocketHandlerOptions) {
    this.wss = wss;
    this.logger = logger;
    this.initialize();
  }

  private initialize() {
    this.logger.info("WebSocket server initialized");
    this.wss.on("connection", this.onConnection.bind(this));
  }

  private onConnection(ws: WebSocket, req: IncomingMessage) {
    const ip = this.getIP(req);
    this.logger.info(`Incoming WebSocket connection from IP: ${ip}`);

    const authHeader = req.headers.authorization;
    const secretKey = authHeader?.split(" ")[1];

    if (!secretKey || secretKey !== process.env.SECRET_KEY) {
      this.logger.warn(`Unauthorized connection attempt from IP: ${ip}`);
      ws.close(1008, "Unauthorized");
      return;
    }

    this.logger.info(`Connection from IP ${ip} authorized and registered`);

    ws.on("message", (message: any) => {
      this.logger.debug(`Message received from IP ${ip}: ${message}`);
      ws.send(`Echo: ${message}`);
    });

    ws.on("close", (code, reason) => {
      this.logger.info(
        `Connection from IP ${ip} closed. Code: ${code}, Reason: ${reason}`
      );
      this.activeConnections.delete(ip);
    });

    ws.on("error", (err) => {
      this.logger.error(`Error from IP ${ip}: ${err.message}`);
    });
  }

  private getIP(req: IncomingMessage): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0];
    }
    return req.socket.remoteAddress || "Unknown IP";
  }
}
