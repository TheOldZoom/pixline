import { z } from "zod";

export const ShardCreation = z.object({
  name: z.string(),
  nodeId: z.string(),
});

export interface UserJWT {
  id: string;
  name: string;
  email: string;
  role: string;
}
