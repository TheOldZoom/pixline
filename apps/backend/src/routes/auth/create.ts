import { Request, Response, NextFunction } from "express";
import ValidateSchema from "../../utils/middlewares/ValidateSchema";
import { UserCreation } from "../../utils/schemas/User";
import Router from "../../structures/Router";
import { createUser } from "../../utils/db/Users";
import * as jwt from "jsonwebtoken";
const router = new Router();

router.post(
  ValidateSchema(UserCreation),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    const user = await createUser(name, email, password);

    if (user) {
      const token = await jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "7d",
        }
      );
      return res.status(200).json({
        message: "User created successfully",
        token: token,
      });
    }

    return res.status(400).json({
      message: "User already exists",
    });
  }
);

export default router;
