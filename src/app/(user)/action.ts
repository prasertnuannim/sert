"use server";

import { signOut } from "@/lib/auths/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
