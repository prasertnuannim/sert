import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import type { CreateUserDto, UpdateUserDto } from "@/server/dto/user.dto";
import type { Prisma } from "@prisma/client";

const findRoleByName = async (role: string) =>
  prisma.role.findFirst({
    where: { name: { equals: role, mode: "insensitive" } },
  });

const create = async (dto: CreateUserDto) => {
  const { name, email, role } = dto;

  const roleRecord = await findRoleByName(role);
  if (!roleRecord) throw new Error(`Role "${role}" not found`);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error("Email already exists");

  const hashedPassword = await bcrypt.hash("sert", 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      roleId: roleRecord.id,
      emailVerified: null,
      image: null,
    },
    include: { role: true },
  });
};

const getAll = async ({ page, limit }: { page: number; limit: number }) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { role: true },
    }),
    prisma.user.count(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const update = async (userId: string, dto: UpdateUserDto) => {
  const payload: Prisma.UserUpdateInput = {};

  if (dto.name !== undefined) payload.name = dto.name;
  if (dto.email !== undefined) payload.email = dto.email;

  if (dto.role) {
    const roleRecord = await findRoleByName(dto.role);
    if (roleRecord) payload.role = { connect: { id: roleRecord.id } };
  }

  return prisma.user.update({
    where: { id: userId },
    data: payload,
    include: { role: true },
  });
};

const remove = async (userId: string) =>
  prisma.user.delete({ where: { id: userId } });

export const userService = {
  create,
  getAll,
  update,
  delete: remove,
};
