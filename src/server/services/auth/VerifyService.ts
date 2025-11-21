import { prisma } from "@/server/db/prisma";
import { createAppError } from "@/server/security/appError";
import bcrypt from "bcryptjs";

export const createVerifyService = () => {
  const validateUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw createAppError("USER_NOT_FOUND", "Email not found", 404);
    if (!user.password) throw createAppError("PASSWORD_REQUIRED", "Password required", 400);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw createAppError("INVALID_PASSWORD", "Invalid password", 401);

    return user;
  };

  return { validateUser };
};

export const verifyService = createVerifyService();
