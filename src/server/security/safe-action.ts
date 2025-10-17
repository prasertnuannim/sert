"use server";

import { auth } from "@/server/auth/config";

/**
 * Wrapper สำหรับ server action ที่ต้องการตรวจสอบสิทธิ์ก่อนทำงาน
 */
export function withAuthAction<TArgs extends any[], TResult>(
  action: (userId: string, ...args: TArgs) => Promise<TResult>,
  options?: { roles?: string[] }
) {
  return async (...args: TArgs): Promise<TResult> => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (options?.roles?.length && !options.roles.includes(session.user.role ?? "")) {
      throw new Error("Forbidden");
    }

    // revalidatePath("/dashboard"); // ถ้าต้อง refresh page หลัง action
    return action(session.user.id, ...args);
  };
}
