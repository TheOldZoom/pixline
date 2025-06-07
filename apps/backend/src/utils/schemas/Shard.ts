import { z } from "zod";
export const baseShardSchema = z.object({
  name: z
    .string()
    .regex(/^[a-z0-9]+$/, {
      message:
        "Name must only contain lowercase letters and numbers (a-z, 0-9)",
    })
    .max(100, "Name exceeds maximum length of 100 characters")
    .min(2, "Name must be at least 2 characters long"),
  nodeId: z.string(),
});

export const ShardCreation = baseShardSchema;
export type ShardCreationType = z.infer<typeof ShardCreation>;

export const ShardUpdate = baseShardSchema.partial();
export type ShardUpdateType = z.infer<typeof ShardUpdate>;
