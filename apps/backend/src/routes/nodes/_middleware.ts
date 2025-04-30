import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { UserJWT } from "../../utils/schemas/User";
export default async function handler(
  req: Request,
  Response: Response,
  next: NextFunction
) {
  const authorization = req.headers?.authorization;

  if (!authorization) {
    return Response.status(401).json({ message: "Unauthorized" });
  }
  const token = authorization.split(" ")[1];

  if (!token) {
    return Response.status(401).json({ message: "Unauthorized" });
  }
  let decodedToken: string | jwt.JwtPayload | null = null;
  try {
    decodedToken = await jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (error) {}

  if (!decodedToken) {
    return Response.status(401).json({ message: "Unauthorized" });
  }

  req.user = decodedToken as typeof UserJWT;

  next();
}
