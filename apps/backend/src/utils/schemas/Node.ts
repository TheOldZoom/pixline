import { z } from "zod";

const isIpAddress = (value: string): boolean => {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
};

const baseNodeSchema = z.object({
  identifier: z
    .string()
    .min(1, "Identifier is required")
    .max(253, "Identifier exceeds maximum length")
    .refine((val) => isIpAddress(val) || /^[a-zA-Z0-9.-]+$/.test(val), {
      message: "Identifier must be a valid IP address or FQDN",
    })
    .refine(
      (val) => {
        if (isIpAddress(val)) {
          const parts = val.split(".").map(Number);
          return parts.every((p) => p >= 0 && p <= 255);
        }
        return true;
      },
      { message: "Invalid IP address segments" }
    ),

  port: z
    .number()
    .int("Port must be an integer")
    .min(1, "Port must be between 1 and 65535")
    .max(65535, "Port must be between 1 and 65535"),

  label: z
    .string()
    .min(1, "Label is required")
    .max(100, "Label exceeds maximum length of 100 characters")
    .trim(),

  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location exceeds maximum length of 100 characters")
    .trim(),

  ssl: z.boolean().default(false),

  secret_key: z
    .string()
    .min(3, "Secret_key must be at least 3 characters")
    .max(360, "Secret_key exceeds maximum length"),
});

export const NodeCreation = baseNodeSchema;
export type NodeCreationType = z.infer<typeof NodeCreation>;

export const NodeUpdate = baseNodeSchema.partial();
export type NodeUpdateType = z.infer<typeof NodeUpdate>;
