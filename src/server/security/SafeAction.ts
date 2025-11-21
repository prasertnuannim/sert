import { auth } from "@/server/services/auth/authService";

type WithAuthOptions = {
  roles?: string[];
  requireAuth?: boolean;
};

type ProtectedAction<TArgs extends unknown[], TResult> = (
  userId: string | null,
  ...args: TArgs
) => Promise<TResult>;

export function withAuthAction<TArgs extends unknown[], TResult>(
  action: ProtectedAction<TArgs, TResult>,
  options?: WithAuthOptions,
) {
  return async (...args: TArgs): Promise<TResult> => {
    const requireAuth = options?.requireAuth !== false;

    if (!requireAuth) {
      return action(null, ...args);
    }

    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (options?.roles?.length && !options.roles.includes(session.user.role ?? "")) {
      throw new Error("Forbidden");
    }
    return action(session.user.id, ...args);
  };
}
