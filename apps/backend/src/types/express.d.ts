import "express";
import { UserJWT } from "../utils/schemas/User";

declare module "express" {
  interface Request {
    user?: typeof UserJWT | null;
  }
}
