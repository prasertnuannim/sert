import { z } from "zod";

export class UserDTO {
  static Create = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    role: z.string().min(1, "Role is required"),
  });

  static Update = z.object({
    name: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    role: z.string().optional().nullable(),
  });

  static Response = z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().email().nullable(),
    password: z.string().nullable(),
    emailVerified: z.date().nullable(),
    image: z.string().nullable(),
    roleId: z.string().nullable(),
    role: z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  });
}

export type CreateUserDto = z.infer<typeof UserDTO.Create>;
export type UpdateUserDto = z.infer<typeof UserDTO.Update>;
export type UserResponseDto = z.infer<typeof UserDTO.Response>;
