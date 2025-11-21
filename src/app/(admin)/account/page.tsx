import { redirect } from "next/navigation";
import AccountForm from "./accountForm";
import { SessionService } from "@/server/services/auth/sessionService";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await SessionService.get();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <main className="max-w-5xl mx-auto py-12">
      <div className="mb-1">
        <h1 className="text-3xl font-semibold">Account Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, roles, and access from a single dashboard.
        </p>
      </div>
      <AccountForm />
    </main>
  );
}
