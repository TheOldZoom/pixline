import Router from "../../../structures/Router";
import Prisma from "../../../utils/db/Prisma";
import * as jwt from "jsonwebtoken";
import { User } from "../../../prisma/.client";
import middleware from "../../shards/_middleware";
const router = new Router();

let hasUser = false;

router.get(
  (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let decodedToken: string | jwt.JwtPayload | null = null;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decodedToken as User;

    next();
  },

  async (req, res) => {
    const id = req.params.id;

    const user = await Prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userWithoutPassword = {
      ...user,
      password: undefined,
    };

    return res.status(200).json({
      message: "User found",
      user: userWithoutPassword,
    });
  }
);

router.delete(middleware, async (req, res) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Missing id" });
  }

  if (req.user.id === id) {
    return res.status(400).json({ message: "You can't delete yourself" });
  }

  try {
    const userToDelete = await Prisma.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    const firstUser = await Prisma.user.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (firstUser?.id === id) {
      return res.status(400).json({ message: "You can't delete the owner" });
    }

    await Prisma.user.delete({ where: { id } });

    return res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
