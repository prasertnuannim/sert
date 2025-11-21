"use server";

import { resolveSessionMaxAgeSeconds, SessionService } from "@/server/services/auth/sessionService";

import { revalidatePath } from "next/cache";


// ✅ บันทึกค่าการตั้งค่า Auth เช่น redirect path และ session timeout
export async function updateAuthSettings(formData: FormData) {
  const session = await SessionService.get();

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const sessionMaxAge = resolveSessionMaxAgeSeconds(formData.get("sessionMaxAge")?.toString());

  // ตัวอย่าง: update ค่าลง environment (หรือ database setting)
  process.env.SESSION_MAX_AGE = String(sessionMaxAge);

  revalidatePath("/admin/auth-settings");
  return { ok: true };
}
