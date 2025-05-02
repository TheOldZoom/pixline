import { NextFunction, Request, Response } from "express";

export default async function middleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (auth !== `Bearer ${process.env.SECRET_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log("hi");
  next();
}
