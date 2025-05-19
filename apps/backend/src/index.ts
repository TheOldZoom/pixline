import dotenv from "dotenv";
import express from "express";
import RouteLoader from "./structures/RouteLoader";
import Logger from "./structures/Logger";
import analyzeCodebase from "./utils/helpers/ReadCodebase";
import Nodes from "./utils/db/Nodes";
import Prisma from "./utils/db/Prisma";
import * as path from "path";
if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

const app = express();
const PORT = parseInt(process.env.PORT || "3002", 10);
const logger = new Logger({
  appName: "App",
  colors: true,
  minLevel: Logger.LOG_LEVELS.DEBUG,
  showLogLevel: true,
  showTimestamp: true,
});

app.use((req, res, next) => {
  res.header("x-powered-by", "Pixline");
  res.header("Access-Control-Allow-Origin", "*");

  next();
});

const routeLoader = new RouteLoader({
  app,
  path: "./src/routes",
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, async () => {
  const codebaseStats = analyzeCodebase(path.join(process.cwd(), "..", ".."));
  logger.debug("Codebase Statistics:");
  logger.debug(`Total Files: ${codebaseStats.totalFiles}`);
  logger.debug(`Total Folders: ${codebaseStats.totalFolders}`);
  logger.debug(`Total Characters: ${codebaseStats.totalCharacters}`);
  logger.debug(`Total Word Count: ${codebaseStats.totalWordCount}`);

  logger.debug(`Total Lines: ${codebaseStats.totalLines}`);
  logger.debug(`Total Code Lines: ${codebaseStats.totalCodeLines}`);
  logger.debug(`Total Empty Lines: ${codebaseStats.totalEmptyLines}`);
  logger.debug(`Total Comment Lines: ${codebaseStats.totalCommentLines}`);
  logger.debug(`Average Lines Per File: ${codebaseStats.avgLinesPerFile}`);

  logger.info(`Server started on port ${PORT}`);
  const nodes = await Prisma.node.findMany();
  logger.info(`Loaded ${nodes.length} nodes`);

  nodes.forEach((node) => {
    Nodes.addNode(node);
  });
});
