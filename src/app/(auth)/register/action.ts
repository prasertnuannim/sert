"use server";

import { RegisterDTO, RegisterResponseDto } from "@/server/dto/register.dto";
import { registerService } from "@/server/services/register.service";
import { AppError } from "@/server/security/AppError";

const resolveErrorMessage = (error: unknown) => {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unexpected error occurred.";
};

export async function registerUser(
  _prevState: unknown,
  formData: FormData
): Promise<RegisterResponseDto> {
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

    return {
      errors,
      values: { name: raw.name, email: raw.email },
    };
  }

  try {
    await registerService.register(parsed.data);
    return { success: true };
  } catch (error: unknown) {
    return {
      errors: { general: resolveErrorMessage(error) },
      values: { name: raw.name, email: raw.email },
    };
  }
}
