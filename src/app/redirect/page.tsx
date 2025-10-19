import { getServerAuthSession } from "@/server/auth/session";
import ClientRedirect from "./client-redirect";

export default async function RedirectPage() {
  const session = await getServerAuthSession();
  const role = session?.user?.role || "guest";
  return <ClientRedirect role={role} />;
}
