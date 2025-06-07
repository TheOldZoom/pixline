import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";
import ValidateSchema from "../../utils/middlewares/ValidateSchema";
import { ShardCreation } from "../../utils/schemas/Shard";

const router = new Router();

router.post(ValidateSchema(ShardCreation), async (req, res) => {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ message: "Forbidden" });
  const { name, nodeId } = req.body;

  const nodeExists = await Prisma.node.findFirst({
    where: {
      id: nodeId,
    },
  });

  if (!nodeExists) {
    return res.status(404).json({ message: "Node not found" });
  }

  const shardExists = await Prisma.shard.findFirst({
    where: {
      name: name,
    },
  });

  if (shardExists) {
    return res.status(409).json({ message: "Shard already exists" });
  }

  const shard = await Prisma.shard.create({
    data: {
      name: name,
      nodeId: nodeId,
      users: {
        connect: [
          {
            id: req.user.id,
          },
        ],
      },
    },
    include: {
      node: true,
      users: true,
    },
  });

  return res.json({
    message: "Shard created successfully",
    shard: shard,
  });
});

export default router;
