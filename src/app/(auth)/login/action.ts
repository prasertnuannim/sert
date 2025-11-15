"use server";

import { loginSchema } from "@/lib/validators/auth";
import { LoginFormState } from "@/types/auth.type";
import { AppError } from "@/server/security/AppError";
import { signIn } from "@/server/services/auth/AuthService";
import { verifyService } from "@/server/services/auth/VerifyService";

export async function loginUser(
  _: unknown,
  formData: FormData
): Promise<LoginFormState> {
  try {
    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const result = loginSchema.safeParse(raw);
    if (!result.success) {
      const errors: LoginFormState["errors"] = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        errors[field] = err.message;
      });
      return { errors, values: { email: raw.email } };
    }

    await verifyService.validateUser(raw.email, raw.password);

    const res = await signIn("credentials", {
      redirect: false,
      email: raw.email,
      password: raw.password,
    });

    if (!res || res.error) {
      throw new AppError(
        "SIGNIN_FAILED",
        "Something went wrong. Please try again."
      );
    }
    return { success: true };
  } catch (err) {
    if (err instanceof AppError) {
      return {
        errors: { general: err.message },
        values: { email: "" },
      };
    }
    return {
      errors: { general: "Unexpected error occurred. Please try again." },
      values: { email: "" },
    }
  }
}
