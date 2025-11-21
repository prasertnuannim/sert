"use server";

import { signOut } from "@/server/services/auth/authService";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
