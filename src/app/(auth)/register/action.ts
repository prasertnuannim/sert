"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators/auth";
import { AuthFormState } from "@/types/auth.type";

export async function registerUser(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
const raw = {
  name: (formData.get("name") as string) ?? "",
  email: (formData.get("email") as string) ?? "",
  password: (formData.get("password") as string) ?? "",
  confirmPassword: (formData.get("confirmPassword") as string) ?? "",
};


  const result = registerSchema.safeParse(raw);

  if (!result.success) {
    const errors: AuthFormState["errors"] = {};
    result.error.errors.forEach((error) => {
      const field = error.path[0] as keyof AuthFormState["errors"];
      errors[field] = error.message;
    });
    return { errors, values: raw };
  }
  const { name, email, password } = result.data;
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  const existingName = await prisma.user.findFirst({ where: { name } });
  const errors: AuthFormState["errors"] = {};
  if (existingEmail) errors.email = "Email is already registered";
  if (existingName) errors.name = "Username is already taken";
  if (Object.keys(errors).length > 0) {
    return { errors, values: raw };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = await prisma.role.findUnique({
    where: { name: "user" },
  });
  if (!role) {
    return {
      errors: { general: "Default role not found." },
      values: raw,
    };
  }
  await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashedPassword, 
      role: {
        connect: { id: role.id },
      },
    },
  });

  redirect("/login");
}
