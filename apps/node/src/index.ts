import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import RouteLoader from "./structures/RouteLoader";
import Logger from "./structures/Logger";
import WebSocketHandler from "./structures/WebSocketHandler";

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT ?? "3002", 10);

const logger = new Logger({
  appName: "App",
  colors: true,
  minLevel: Logger.LOG_LEVELS.DEBUG,
  showLogLevel: true,
  showTimestamp: true,
});

app.use((req, res, next) => {
  console.log(req.path);

  next();
});

const routeLoader = new RouteLoader({
  app,
  path: "./src/routes",
});

const wss = new WebSocketServer({ server });
const websocketHandler = new WebSocketHandler({ wss, logger });

app.use(express.static("uploads"));

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
