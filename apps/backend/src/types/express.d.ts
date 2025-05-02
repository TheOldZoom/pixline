import "express";
import { Shard, User } from "../prisma/.client";
import { Prisma } from "@prisma/client";

declare module "express" {
  interface Request {
    user: User | null;
    shard: Prisma.ShardGetPayload<{ include: { node: true; users: true } }>;
  }
}
