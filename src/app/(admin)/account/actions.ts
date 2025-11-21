"use server";

import { revalidatePath } from "next/cache";
import { withAuthAction } from "@/server/security/safeAction";
import { UserDTO } from "@/server/dto/user.dto";
import { userService } from "@/server/services/userService";
import { userMapper } from "@/server/mappers/user.mapper";
import type { AccountActionResult, FullUser } from "@/types/account.type";
import { AccessRole } from "@/server/services/auth/authService";
import { PaginationDTO } from "@/server/dto/pagination.dto";

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred";

const createUser = async (
  _sessionUserId: string | null,
  formData: FormData,
): Promise<AccountActionResult<FullUser>> => {
  const parsed = UserDTO.Create.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const user = await userService.create(parsed.data);
    revalidatePath("/account");
    return { success: true, data: userMapper.toResponse(user) };
  } catch (error: unknown) {
    return { success: false, error: toErrorMessage(error) };
  }
};

const getUsers = async (
  _sessionUserId: string | null,
  raw?: unknown,
) => {
  const parsed = PaginationDTO.safeParse(raw ?? {});
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const result = await userService.getAll(parsed.data);

  return {
    success: true,
    ...result,
    data: userMapper.toResponseList(result.data),
  };
};

const updateUser = async (
  _sessionUserId: string | null,
  userId: string,
  data: unknown,
): Promise<AccountActionResult<FullUser>> => {
  const parsed = UserDTO.Update.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const updated = await userService.update(userId, parsed.data);
    revalidatePath("/account");
    return { success: true, data: userMapper.toResponse(updated) };
  } catch (error: unknown) {
    return { success: false, error: toErrorMessage(error) };
  }
};

const deleteUser = async (
  _sessionUserId: string | null,
  userId: string,
): Promise<AccountActionResult<null>> => {
  try {
    await userService.delete(userId);
    revalidatePath("/account");
    return { success: true, data: null };
  } catch (error: unknown) {
    return { success: false, error: toErrorMessage(error) };
  }
};

export const createUserAction = withAuthAction(createUser, { roles: [AccessRole.Admin] });

export const getUsersAction = withAuthAction(getUsers, { roles: [AccessRole.Admin] });

export const updateUserAction = withAuthAction(updateUser, { roles: [AccessRole.Admin] });

export const deleteUserAction = withAuthAction(deleteUser, { roles: [AccessRole.Admin] });
