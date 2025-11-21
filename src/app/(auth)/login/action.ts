"use server";

import { loginSchema } from "@/lib/validators/auth";
import { LoginFormState } from "@/types/auth.type";
import { signIn } from "@/server/services/auth/authService";
import { verifyService } from "@/server/services/auth/verifyService";
import { createAppError, isAppError } from "@/server/security/appError";
import { createRateLimiter } from "@/server/security/rateLimiter";

const loginRateLimiter = createRateLimiter(5, 60);

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

    const { email, password } = result.data;

    await loginRateLimiter.check(`login:${email}`);

    await verifyService.validateUser(email, password);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      throw createAppError(
        "SIGNIN_FAILED",
        "Something went wrong. Please try again."
      );
    }
    return { success: true };
  } catch (err) {
    if (isAppError(err)) {
      return {
        errors: { general: err.message },
        values: { email: "" },
      };
    }
    if (err instanceof Error && err.message === "Too many requests") {
      return {
        errors: { general: "Too many login attempts. Please try again later." },
        values: { email: "" },
      };
    }
    return {
      errors: { general: "Unexpected error occurred. Please try again." },
      values: { email: "" },
    }
  }
}
