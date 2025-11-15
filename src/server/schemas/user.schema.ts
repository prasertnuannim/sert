import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export const userResponseSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  email: z.string(),
});
