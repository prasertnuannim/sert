"use server";

import { RegisterDTO } from "@/server/dto/register.dto";
import { registerService } from "@/server/services/registerService";
import { isAppError } from "@/server/security/appError";
import { AuthFormState } from "@/types/auth.type";

const resolveErrorMessage = (error: unknown) => {
  if (isAppError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return "Unexpected error occurred.";
};

export async function registerUser(
  _prevState: unknown,
  formData: FormData
): Promise<AuthFormState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };

  const parsed = RegisterDTO.Register.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.errors.forEach((err) => {
      const field = err.path[0] as string;
      errors[field] = err.message;
    });

    return { errors, values: raw };
  }

  try {
    await registerService.register(parsed.data);
    return { success: true, values: raw };
  } catch (error: unknown) {
    return {
      errors: { general: resolveErrorMessage(error) },
      values: raw,
    };
  }
}
