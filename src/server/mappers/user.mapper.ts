import { UserDTO } from "@/server/dto/user.dto";
import type { FullUser } from "@/types/account.type";
import type { User, Role } from "@prisma/client";

export class UserMapper {
  toResponse(user: User & { role?: Role | null }): FullUser {
    return UserDTO.Response.parse({
      id: user.id,
      name: user.name,
      email: user.email,
      password: null,
      emailVerified: user.emailVerified,
      image: user.image,
      roleId: user.roleId,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
          }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }

  toResponseList(users: (User & { role?: Role | null })[]): FullUser[] {
    return users.map((u) => this.toResponse(u));
  }
}

// Singleton
export const userMapper = new UserMapper();
