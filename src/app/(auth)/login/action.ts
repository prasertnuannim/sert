"use server";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auths/auth";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validators/auth";
import { LoginFormState } from "@/types/auth.type";

export async function loginUser(_: unknown, formData: FormData): Promise<LoginFormState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    const errors: LoginFormState["errors"] = {};
    result.error.errors.forEach((error) => {
      const field = error.path[0] as keyof typeof errors;
      errors[field] = error.message;
    });
    return { errors, values: { email: raw.email } };
  }
  const user = await prisma.user.findFirst({
    where: { email: raw.email },
  });
  if (!user) {
    return {
      errors: { general: "Not found email" },
      values: { email: raw.email },
    };
  }
  if (!user.password) {
    return {
      errors: { general: "Password is required" },
      values: { email: raw.email, password: raw.password },
    };
  }
  const isValid = await bcrypt.compare(raw.password, user.password);
  if (!isValid) {
    return {
      errors: { general: "Invalid password" },
      values: { email: raw.email, password: raw.password },
    };
  }
  const res = await signIn("credentials", {
    redirect: false,
    email: raw.email,
    password: raw.password,
  });
  if (!res || res.error) {
    return {
      errors: { general: "Something went wrong. Please try again." },
      values: { email: raw.email },
    };
  }
     return { success: true };
}