// src/server/services/user.service.ts
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import { userMapper } from "../mappers/user.mapper";

export async function createUserService(data: any) {
  const entity = userMapper.toEntity(data);

  // ตรวจซ้ำ
  const existing = await prisma.user.findUnique({
    where: { email: entity.email },
  });
  if (existing) throw new Error("อีเมลนี้ถูกใช้งานแล้ว");

  // หา role เริ่มต้น
  const role = await prisma.role.findUnique({ where: { name: "user" } });
  if (!role) throw new Error("Default role not found");

  const hashed = await bcrypt.hash(entity.password, 10);

  const created = await prisma.user.create({
    data: {
      ...entity,
      password: hashed,
      role: { connect: { id: role.id } },
    },
  });

  return userMapper.toResponse(created);
}
