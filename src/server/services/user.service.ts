import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";
import { userMapper } from "@/server/mappers/user.mapper";
import { AppError } from "@/server/security/app-error";

export async function createUserService(data: any) {
  const entity = userMapper.toEntity(data);

  // ✅ ตรวจอีเมลซ้ำ
  const existing = await prisma.user.findUnique({
    where: { email: entity.email },
  });
  if (existing) {
    throw new AppError("USER_EXISTS", "อีเมลนี้ถูกใช้งานแล้ว", 409);
  }

  // ✅ ตรวจว่ามี role "user" ในระบบหรือยัง
  const role = await prisma.role.findUnique({
    where: { name: "user" },
  });
  if (!role) {
    throw new AppError("ROLE_NOT_FOUND", "ไม่พบสิทธิ์เริ่มต้น (Default role)", 500);
  }

  // ✅ เข้ารหัสรหัสผ่าน
  const hashed = await bcrypt.hash(entity.password, 10);

  // ✅ สร้างข้อมูล user ในฐานข้อมูล
  const created = await prisma.user.create({
    data: {
      ...entity,
      password: hashed,
      role: { connect: { id: role.id } },
    },
  });

  // ✅ (ต่อยอดได้ภายหลัง) เพิ่ม audit log เช่น:
  // await auditLogService.log({
  //   action: "REGISTER",
  //   userId: created.id,
  //   email: created.email,
  //   ip,
  //   ua,
  // });

  // ✅ คืนค่าที่ผ่าน mapper (สำหรับ response หรือ state)
  return userMapper.toResponse(created);
}
