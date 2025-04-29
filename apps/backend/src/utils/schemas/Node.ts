import { z } from "zod";

export const NodeCreation = z.object({
  ip: z.string(),
  port: z.number(),
  label: z.string(),
  authorization: z.string(),
});
