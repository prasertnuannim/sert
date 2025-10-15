import { auth } from "@/server/auth/config";

export async function getServerAuthSession() {
  const session = await auth();
  return session;
}
