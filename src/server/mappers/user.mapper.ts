// src/server/mappers/user.mapper.ts
import { createUserSchema, userResponseSchema } from "../schemas/user.schema";
import type { z } from "zod";

export const userMapper = {
  toEntity: (data: z.infer<typeof createUserSchema>) => {
    const parsed = createUserSchema.parse(data);
    return {
      name: parsed.name.trim(),
      email: parsed.email.toLowerCase(),
      password: parsed.password,
    };
  },

  toResponse: (user: any) => {
    return userResponseSchema.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    });
  },
};
