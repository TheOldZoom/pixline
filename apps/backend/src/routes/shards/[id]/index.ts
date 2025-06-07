import { Request, Response } from "express";
import Router from "../../../structures/Router";
import Prisma from "../../../utils/db/Prisma";
// import ValidateSchema from "../../../utils/middlewares/ValidateSchema";
// import { ShardCreation, ShardCreationType } from "../../../utils/schemas/Shard";

const router = new Router();

router.delete(async (req: Request, res: Response) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const shardId = req.params.id;
  if (!shardId) {
    return res.status(400).json({ message: "Missing id" });
  }

  try {
    const shard = await Prisma.shard.findUnique({
      where: { id: shardId },
    });

    if (!shard) {
      return res.status(404).json({ message: "shard not found" });
    }

    await Prisma.shard.delete({
      where: { id: shardId },
    });

    return res.json({ message: "shard deleted" });
  } catch (error) {
    console.error("Error deleting shard:", error);
    return res.status(500).json({ message: "Failed to delete shard" });
  }
});

// router.put(
//   ValidateSchema(ShardCreation),
//   async (req: Request, res: Response) => {
//     const user = req.user;
//     const shardId = req.params.id;

//     if (user?.role !== "ADMIN") {
//       return res.status(403).json({ message: "Forbidden" });
//     }

//     if (!shardId) {
//       return res.status(400).json({ message: "Missing id" });
//     }

//     try {
//       const { name }: ShardCreationType = req.body;

//       const shardToUpdate = await Prisma.shard.findUnique({
//         where: { id: shardId },
//       });

//       if (!shardToUpdate) {
//         return res.status(404).json({ message: "shard not found" });
//       }

//       const conflictingshard = await Prisma.shard.findFirst({
//         where: {
//           name,
//           NOT: { id: shardId },
//         },
//       });

//       if (conflictingshard) {
//         return res.status(409).json({
//           message: "Validation failed",
//           errors: {
//             name: "A shard with this name already exists",
//           },
//         });
//       }

//       const updatedshard = await Prisma.shard.update({
//         where: { id: shardId },
//         data: { name },
//       });

//       return res.status(200).json({
//         message: "Shard updated successfully",
//         node: updatedshard,
//       });
//     } catch (error) {
//       console.error("Error updating shard:", error);
//       return res.status(500).json({
//         message: "Failed to update shard",
//       });
//     }
//   }
// );

export default router;
