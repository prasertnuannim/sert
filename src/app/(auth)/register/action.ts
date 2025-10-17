"use server";

import { redirect } from "next/navigation";
import { registerSchema } from "@/lib/validators/auth";
import { AuthFormState } from "@/types/auth.type";
import { createUserService } from "@/server/services/user.service";
import { AppError } from "@/server/security/app-error";

export async function registerUser(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  try {
    const raw = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const result = registerSchema.safeParse(raw);
    if (!result.success) {
      const errors: AuthFormState["errors"] = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof AuthFormState["errors"];
        errors[field] = err.message;
      });
      return { errors, values: raw };
    }

    if (raw.password !== raw.confirmPassword) {
      return {
        errors: { confirmPassword: "รหัสผ่านไม่ตรงกัน" },
        values: raw,
      };
    }

    await createUserService(raw);
    redirect("/login");
  } catch (err: any) {
    console.error("[REGISTER_ERROR]", err);

    if (err instanceof AppError) {
      return {
        errors: { general: err.message },
        values: {},
      };
    }

    return {
      errors: { general: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" },
      values: {},
    };
  }
}
