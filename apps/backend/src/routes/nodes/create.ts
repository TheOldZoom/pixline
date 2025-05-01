import { NodeStatus } from "../../prisma/.client";
import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";
import ValidateSchema from "../../utils/middlewares/ValidateSchema";
import { NodeCreation, NodeCreationType } from "../../utils/schemas/Node";
import { Request, Response } from "express";

const router = new Router();

router.post(
  ValidateSchema(NodeCreation),
  async (req: Request, res: Response) => {
    const user = req.user;

    if (user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
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

      const existingNode = await Prisma.node.findFirst({
        where: {
          identifier,
          port,
        },
      });

      if (existingNode) {
        return res.status(409).json({
          message: `Node already exists with identifier ${identifier} and port ${port}`,
        });
      }

      const newNode = await Prisma.node.create({
        data: {
          identifier,
          port,
          label,
          location,
          ssl: ssl ?? false,
          secret_key,
          status: "OFFLINE" as NodeStatus,
        },
      });

      return res.status(201).json({
        message: "Node created successfully",
        node: newNode,
      });
    } catch (error: unknown) {
      console.error("Error creating node:", error);
      return res.status(500).json({
        message: "Failed to create node",
      });
    }
  }
);

export default router;
