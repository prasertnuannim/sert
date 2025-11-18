import { hash } from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import type { RegisterDto } from "@/server/dto/register.dto";
import { AppError } from "@/server/security/AppError";

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new AppError("EMAIL_EXISTS", "Email already registered.");
    }

    await prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await hash(dto.password, 10),
        role: { connect: { name: "user" } },
      },
    });

    return true;
  }
}

export const registerService = new AuthService();
