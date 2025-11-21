
import { resolveSessionMaxAgeSeconds, SessionService } from "@/server/services/auth/sessionService";
import { redirect } from "next/navigation";
import { AuthSettingsForm } from "./authSettingsForm";


export const dynamic = "force-dynamic"; // SSR ทุกครั้ง

export default async function AuthSettingsPage() {
  const session = await SessionService.get();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const sessionMaxAgeSeconds = resolveSessionMaxAgeSeconds(process.env.SESSION_MAX_AGE);

  return (
    <main className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">⚙️ Auth Settings</h1>
      <AuthSettingsForm sessionMaxAge={String(sessionMaxAgeSeconds)} />
    </main>
  );
}
