import { z } from "zod";

export const UserCreation = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const UserLogin = z.object({
  email: z.string().email(),
  password: z.string(),
});

export interface UserJWT {
  id: string;
  name: string;
  email: string;
  role: string;
}
