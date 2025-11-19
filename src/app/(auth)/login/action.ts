"use server";

import { loginSchema } from "@/lib/validators/auth";
import { LoginFormState } from "@/types/auth.type";
import { AppError } from "@/server/security/AppError";
import { RateLimiter } from "@/server/security/RateLimiter";
import { signIn } from "@/server/services/auth/AuthService";
import { verifyService } from "@/server/services/auth/VerifyService";

const loginRateLimiter = new RateLimiter(5, 60);

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
