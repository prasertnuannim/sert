"use server";

import { revalidatePath } from "next/cache";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { withAuthAction } from "@/server/security/SafeAction";
import { AccessRole } from "@/lib/auth/access-role";

type CreateUserResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

const ADMIN_ONLY = { roles: [AccessRole.Admin] };

async function handleCreateUserAction(
  _sessionUserId: string | null,
  formData: FormData,
): Promise<CreateUserResponse> {
  void _sessionUserId;
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const roleName = formData.get("role") as string;

    if (!name || !email || !roleName) {
      return { success: false, error: "Missing required form fields" };
    }

    const roleRecord = await prisma.role.findFirst({ where: { name: roleName } });
    if (!roleRecord) {
      return { success: false, error: `Role "${roleName}" not found.` };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }

    const defaultPassword = "sert";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null,
        image: null,
        roleId: roleRecord.id,
      },
    });

    revalidatePath("/account");

    return { success: true, message: "User created successfully" };
  } catch (error: unknown) {
    console.error("Create user failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

async function handleGetUsersAction(_sessionUserId: string | null): Promise<User[]> {
  void _sessionUserId;
  return prisma.user.findMany({ include: { role: true } });
}

type UpdateUserData = {
  name?: string | null;
  email?: string | null;
  role?: string | null; // role name (e.g. 'admin'|'user') -- will be mapped to relation
};

async function handleUpdateUserAction(
  _sessionUserId: string | null,
  targetUserId: string,
  data: UpdateUserData,
) {
  void _sessionUserId;
  const payload: {
    name?: string | null;
    email?: string | null;
    role?: { connect: { id: string } };
  } = {};

  if (Object.prototype.hasOwnProperty.call(data, "name")) {
    payload.name = data.name ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(data, "email")) {
    payload.email = data.email ?? null;
  }

  if (data.role && typeof data.role === "string") {
    const roleRecord = await prisma.role.findFirst({
      where: { name: { equals: data.role, mode: "insensitive" } },
    });
    if (roleRecord) {
      payload.role = { connect: { id: roleRecord.id } };
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: payload,
  });
  revalidatePath("/account");
  return updatedUser;
}

async function handleDeleteUserAction(_sessionUserId: string | null, targetUserId: string) {
  void _sessionUserId;
  try {
    await prisma.user.delete({ where: { id: targetUserId } });
    revalidatePath("/account");
    return { success: true };
  } catch (error: unknown) {
    console.error("Hard delete user failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to hard delete user" };
  }
}

export const createUserAction = withAuthAction(handleCreateUserAction, ADMIN_ONLY);
export const getUsersAction = withAuthAction(handleGetUsersAction, ADMIN_ONLY);
export const updateUserAction = withAuthAction(handleUpdateUserAction, ADMIN_ONLY);
export const deleteUserAction = withAuthAction(handleDeleteUserAction, ADMIN_ONLY);
