// src/server/mappers/user.mapper.ts
import { z } from "zod";
import type { Prisma, User, Role } from "@prisma/client";
import { BaseMapper } from "./base.mapper";

// ✅ สร้าง schema สำหรับ response
export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.date(),
});

export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * UserMapper (Prisma-aware)
 * - ใช้ Prisma Model โดยตรง (User)
 */
export class UserMapper extends BaseMapper<User & { role?: Role | null }, UserResponse> {
  protected schema = userResponseSchema;

  public toEntity(data: Partial<User>): Partial<User> {
    return {
      name: data.name?.trim(),
      email: data.email?.toLowerCase(),
      password: data.password,
      roleId: data.roleId,
    };
  }

  protected mapToResponse(entity: User & { role?: Role | null }): UserResponse {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role?.name ?? entity.roleId ?? null,
      image: entity.image ?? null,
      createdAt: entity.createdAt,
    };
  }
}
