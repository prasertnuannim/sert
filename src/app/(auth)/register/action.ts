"use server";

import { redirect } from "next/navigation";
import { registerSchema } from "@/lib/validators/auth";
import { AuthFormState } from "@/types/auth.type";
import { createUserService } from "@/server/services/user.service";

export async function registerUser(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
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

  try {
    await createUserService({
      name: raw.name,
      email: raw.email,
      password: raw.password,
    });
    redirect("/login");
  } catch (err: any) {
    return {
      errors: { general: err.message ?? "สมัครสมาชิกไม่สำเร็จ" },
      values: raw,
    };
  }
}
