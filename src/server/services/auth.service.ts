import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "@/server/security/app-error";

export const authService = {
  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("USER_NOT_FOUND", "Email not found", 404);
    if (!user.password) throw new AppError("PASSWORD_REQUIRED", "Password is required", 400);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError("INVALID_PASSWORD", "Invalid password", 401);

    return user;
  },
};
