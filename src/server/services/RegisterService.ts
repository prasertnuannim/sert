import { hash } from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import type { RegisterDto } from "@/server/dto/register.dto";
import { createAppError } from "@/server/security/appError";

const register = async (dto: RegisterDto) => {
  const existing = await prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existing) {
    throw createAppError("EMAIL_EXISTS", "Email already registered.");
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
};

export const registerService = { register };
