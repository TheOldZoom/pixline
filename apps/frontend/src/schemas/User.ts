import { z } from "zod";

export const UserCreate = z.object({
  name: z.string().min(2),
  email: z.string().min(1).email(),
  password: z.string().min(6),
});

export const UserLogin = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(6),
});
