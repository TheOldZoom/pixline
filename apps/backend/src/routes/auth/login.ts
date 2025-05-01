import { Request, Response, NextFunction } from "express";
import ValidateSchema from "../../utils/middlewares/ValidateSchema";
import { UserLogin } from "../../utils/schemas/User";
import Router from "../../structures/Router";
import * as jwt from "jsonwebtoken";
import { getUserByEmail } from "../../utils/db/Users";
const router = new Router();
import * as bcrypt from "bcrypt";
router.post(
  ValidateSchema(UserLogin),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!bcrypt.compare(req.body.password, user.password)) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const token = await jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
    });
  }
);

export default router;
