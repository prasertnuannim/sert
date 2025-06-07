import { auth, signOut } from "@/lib/auths/auth";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    return <p className="text-center text-red-500 mt-10">Not logged in</p>;
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>
      <p>Welcome, {session.user?.name}!</p>
      <p>Email: {session.user?.email}</p>
      <p>Role: {session.user?.role}</p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
