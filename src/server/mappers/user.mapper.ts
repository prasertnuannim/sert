// src/server/mappers/user.mapper.ts
import { z } from "zod";

export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string().optional(),
  createdAt: z.date().optional(),
});

export const userMapper = {
  toEntity: (data: any) => ({
    name: data.name?.trim(),
    email: data.email?.toLowerCase(),
    password: data.password,
  }),

  toResponse: (user: any) => {
    return userResponseSchema.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name ?? "user",
      createdAt: user.createdAt,
    });
  },
};
