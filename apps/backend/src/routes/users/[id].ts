import Router from "../../structures/Router";
import Prisma from "../../utils/db/Prisma";
import * as jwt from "jsonwebtoken";
import { UserJWT } from "../../utils/schemas/User";
import { User } from "../../prisma/.client";
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

export default router;
