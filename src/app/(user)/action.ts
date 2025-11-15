"use server";

import { signOut } from "@/server/services/auth/AuthService";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
