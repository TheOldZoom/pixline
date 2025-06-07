import { Request, Response, NextFunction } from "express";
import ValidateSchema from "../../utils/middlewares/ValidateSchema";
import { UserCreation } from "../../utils/schemas/User";
import Router from "../../structures/Router";
import { createUser } from "../../utils/db/Users";
import * as jwt from "jsonwebtoken";
import Prisma from "../../utils/db/Prisma";

const router = new Router();

router.post(
  ValidateSchema(UserCreation),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role: requestedRole } = req.body;

      const users = await Prisma.user.findMany();
      const isFirstUser = users.length === 0;

      let role: "USER" | "ADMIN" = "USER";

      if (isFirstUser) {
        role = "ADMIN";
      } else {
        if (requestedRole === "ADMIN") {
          const authHeader = req.headers.authorization;
          if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
              .status(401)
              .json({ message: "Unauthorized: No token provided" });
          }

          const token = authHeader.split(" ")[1];
          let decoded: any;

          try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string);
          } catch (err) {
            return res
              .status(401)
              .json({ message: "Unauthorized: Invalid token" });
          }

          if (decoded.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
          }

          role = "ADMIN";
        }
      }

      const user = await createUser(name, email, password, role);

      if (user) {
        const token = jwt.sign(
          { id: user.id, name: user.name, email: user.email, role: user.role },
          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );
        //@ts-ignore
        delete user.password;
        return res.status(200).json({
          message: "User created successfully",
          token,
          user,
        });
      }

      return res.status(400).json({
        message: "User already exists",
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
