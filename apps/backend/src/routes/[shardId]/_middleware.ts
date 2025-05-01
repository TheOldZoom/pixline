import Prisma from "../../utils/db/Prisma";
import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { UserJWT } from "../../utils/schemas/User";

export default async function handler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers?.authorization;

  if (!authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decodedToken: string | jwt.JwtPayload | null = null;
  try {
    decodedToken = await jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!decodedToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userPayload = decodedToken as UserJWT;

  const user = await Prisma.user.findUnique({
    where: { id: userPayload.id },
  });

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (
    user.name !== userPayload.name ||
    user.email !== userPayload.email ||
    user.role !== userPayload.role
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = user;
  next();
}
