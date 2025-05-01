import NodeConnection from "./Node";
import Logger from "./Logger";
import { Node } from "../prisma/.client";

export default class NodeManager {
  private nodes = new Map<string, NodeConnection>();
  private logger: Logger = new Logger({ appName: "NManager" });

  constructor() {
    this.monitorNodes();
  }

  public addNode(options: Node) {
    if (this.nodes.has(options.identifier)) {
      this.logger.warn(`Node ${options.identifier} already exists.`);
      return;
    }

    const node = new NodeConnection(options);
    this.nodes.set(`${options.identifier}:${options.port}`, node);
    this.logger.info(`Added node ${options.identifier}:${options.port}`);
  }

  public removeNode(identifier: string, port: number) {
    const node = this.nodes.get(`${identifier}:${port}`);
    if (node) {
      node.disconnect();
      this.nodes.delete(`${identifier}:${port}`);
      this.logger.info(`Removed node ${identifier}:${port}`);
    } else {
      this.logger.warn(`Node ${identifier}:${port} not found.`);
    }
  }

  public monitorNodes() {
    setInterval(() => {
      this.nodes.forEach((node, id) => {
        if (!node.isAlive) {
          this.logger.warn(`[${id}] Not alive. Reconnecting...`);
          node.disconnect();
          node.connect();
        }
      });
    }, 30_000);
  }

  public getNodes() {
    return this.nodes;
  }

  public getNode(identifier: string, port: number) {
    return this.nodes.get(`${identifier}:${port}`);
  }

  public getNodesByLocation(location: string) {
    return Array.from(this.nodes.values()).filter(
      (node) => node.options.location === location
    );
  }

  public getNodesByLabel(label: string) {
    return Array.from(this.nodes.values()).filter(
      (node) => node.options.label === label
    );
  }

  public getNodesByIdentifier(identifier: string) {
    return Array.from(this.nodes.values()).filter(
      (node) => node.options.identifier === identifier
    );
  }
}
