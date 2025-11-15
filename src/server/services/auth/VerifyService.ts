import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";
import { AppError } from "@/server/security/AppError";

export class VerifyService {
  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("USER_NOT_FOUND", "Email not found", 404);
    if (!user.password) throw new AppError("PASSWORD_REQUIRED", "Password required", 400);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new AppError("INVALID_PASSWORD", "Invalid password", 401);

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    // TODO: generate JWT or session
    return user;
  }
}

export const verifyService = new VerifyService();