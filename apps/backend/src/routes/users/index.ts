import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";
import * as jwt from "jsonwebtoken";
import { User } from "../../prisma/.client";

const router = new Router();

router.get(
  (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as User;
      req.user = decoded;
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  },

  async (req, res) => {
    const users = await Prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        shards: {
          include: {
            node: true,
            users: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!users) {
      return res.status(404).json({ message: "Users not found" });
    }
    return res.status(200).json(users);
  }
);

export default router;
