"use server";

import { loginSchema } from "@/lib/validators/auth";
import { LoginFormState } from "@/types/auth.type";
import { signIn } from "@/server/auth/config";
import { authService } from "@/server/services/auth.service";
import { AppError } from "@/server/security/app-error";

export async function loginUser(_: unknown, formData: FormData): Promise<LoginFormState> {
  try {
    // ✅ 1. รับ raw input
    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    // ✅ 2. validate ด้วย zod schema
    const result = loginSchema.safeParse(raw);
    if (!result.success) {
      const errors: LoginFormState["errors"] = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        errors[field] = err.message;
      });
      return { errors, values: { email: raw.email } };
    }

    // ✅ 3. ตรวจ user ผ่าน service
    await authService.validateUser(raw.email, raw.password);

    // ✅ 4. Sign in ผ่าน NextAuth
    const res = await signIn("credentials", {
      redirect: false,
      email: raw.email,
      password: raw.password,
    });

    if (!res || res.error) {
      throw new AppError("SIGNIN_FAILED", "Something went wrong. Please try again.");
    }

    // ✅ 5. สำเร็จ
    return { success: true };
  } catch (err) {
    // ✅ 6. จัดการ error แบบปลอดภัย
    if (err instanceof AppError) {
      return {
        errors: { general: err.message },
        values: {},
      };
    }

    console.error("[LOGIN_ERROR]", err);
    return {
      errors: { general: "Unexpected error occurred. Please try again." },
      values: {},
    };
  }
}
