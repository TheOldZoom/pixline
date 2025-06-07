import { Request, Response } from "express";
import Router from "../../../structures/Router";
import Prisma from "../../../utils/db/Prisma";
import ValidateSchema from "../../../utils/middlewares/ValidateSchema";
import Nodes from "../../../utils/db/Nodes";
import { NodeCreation, NodeCreationType } from "../../../utils/schemas/Node";

const router = new Router();

router.delete(async (req: Request, res: Response) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const nodeId = req.params.id;
  if (!nodeId) {
    return res.status(400).json({ message: "Missing id" });
  }

  try {
    const node = await Prisma.node.findUnique({
      where: { id: nodeId },
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    const shardCount = await Prisma.shard.count({
      where: { nodeId },
    });

    if (shardCount > 0) {
      return res.status(409).json({
        message: `Node has ${shardCount} shard(s). Please delete all shards before deleting the node.`,
      });
    }

    await Prisma.node.delete({
      where: { id: nodeId },
    });

    return res.json({ message: "Node deleted successfully" });
  } catch (error) {
    console.error("Error deleting node:", error);
    return res.status(500).json({ message: "Failed to delete node" });
  }
});

router.put(
  ValidateSchema(NodeCreation),
  async (req: Request, res: Response) => {
    const user = req.user;
    const nodeId = req.params.id;

    if (user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!nodeId) {
      return res.status(400).json({ message: "Missing id" });
    }

    try {
      const {
        identifier,
        port,
        label,
        location,
        ssl,
        secret_key,
      }: NodeCreationType = req.body;

      const nodeToUpdate = await Prisma.node.findUnique({
        where: { id: nodeId },
      });

      if (!nodeToUpdate) {
        return res.status(404).json({ message: "Node not found" });
      }

      const conflictingNode = await Prisma.node.findFirst({
        where: {
          identifier,
          port,
          NOT: { id: nodeId },
        },
      });

      if (conflictingNode) {
        return res.status(409).json({
          message: "Validation failed",
          errors: {
            identifier: `Another node already exists with identifier ${identifier}`,
            port: `Port ${port} is already in use for this identifier`,
          },
        });
      }

      const updatedNode = await Prisma.node.update({
        where: { id: nodeId },
        data: {
          identifier,
          port,
          label,
          location,
          ssl: ssl ?? false,
          secret_key,
        },
      });

      await Nodes.updateNode(updatedNode);

      return res.status(200).json({
        message: "Node updated successfully",
        node: updatedNode,
      });
    } catch (error) {
      console.error("Error updating node:", error);
      return res.status(500).json({
        message: "Failed to update node",
      });
    }
  }
);

export default router;
