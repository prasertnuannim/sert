import { auth } from "@/lib/auths/auth";
import ClientRedirect from "./client-redirect";

export default async function RedirectPage() {
  const session = await auth();
  const role = session?.user?.role || "guest";
  return <ClientRedirect role={role} />;
}
