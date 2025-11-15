"use server";

import { registerSchema } from "@/lib/validators/auth";
import { AuthFormState } from "@/types/auth.type";
import { prisma } from "@/server/db/prisma";
import { hash } from "bcryptjs";
import { AppError } from "@/server/security/AppError";

export async function registerUser(
  _: unknown,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  try {
    // ✅ Validate ด้วย Zod
    const result = registerSchema.safeParse(raw);
    if (!result.success) {
      const errors: AuthFormState["errors"] = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        errors[field] = err.message;
      });

      return {
        errors,
        values: {
          name: raw.name,
          email: raw.email,
          password: "",
          confirmPassword: "",
        },
      };
    }

    // ✅ ตรวจ email ซ้ำ
    const existing = await prisma.user.findUnique({
      where: { email: raw.email },
    });
    if (existing) throw new AppError("EMAIL_EXISTS", "Email already registered.");

    // ✅ สร้าง user
    await prisma.user.create({
      data: {
        name: raw.name,
        email: raw.email,
        password: await hash(raw.password, 10),
        role: { connect: { name: "user" } },
      },
    });

    return { success: true };
  } catch (err) {
    if (err instanceof AppError) {
      return {
        errors: { general: err.message },
        values: {
          name: raw.name,
          email: raw.email,
          password: "",
          confirmPassword: "",
        },
      };
    }

    return {
      errors: { general: "Unexpected error occurred. Please try again." },
      values: {
        name: raw.name,
        email: raw.email,
        password: "",
        confirmPassword: "",
      },
    };
  }
}
