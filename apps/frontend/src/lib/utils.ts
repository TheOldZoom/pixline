import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateSchema<T>(data: unknown, schema: z.ZodType<T>) {
  return schema.safeParse(data);
}
