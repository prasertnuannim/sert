import "server-only";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { auth } from "./authService";

type AuthWithRequest = (req: NextRequest) => Promise<Session | null>;

const getSession = async (request?: NextRequest): Promise<Session | null> => {
  try {
    if (request) {
      const runAuth = auth as unknown as AuthWithRequest;
      return await runAuth(request);
    }
    return await auth();
  } catch (err) {
    console.error("Error getting session:", err);
    return null;
  }
};

const getUser = async (request?: NextRequest) => {
  const session = await getSession(request);
  return session?.user ?? null;
};

const isAuthenticated = async (request?: NextRequest) => {
  const user = await getUser(request);
  return !!user?.id;
};

const hasRole = async (role: string, request?: NextRequest) => {
  const user = await getUser(request);
  return user?.role === role;
};

export const SessionService = {
  get: getSession,
  user: getUser,
  isAuthenticated,
  hasRole,
};

/** ✅ ใช้ใน Server Component หรือ API Route */
export async function getServerAuthSession(request?: NextRequest): Promise<Session | null> {
  return getSession(request);
}

/** ✅ ดึงเฉพาะ user */
export async function getSessionUser(request?: NextRequest) {
  return getUser(request);
}

/** ✅ บังคับให้ต้องมี session (เช่นใน Protected API) */
export async function requireServerAuthSession(request?: NextRequest): Promise<Session> {
  const session = await getServerAuthSession(request);
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

export const SESSION_MAX_AGE_DEFAULT_SECONDS = 60 * 50;

export function resolveSessionMaxAgeSeconds(raw?: string | null): number {
  const parsed = raw ? Number(raw) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return SESSION_MAX_AGE_DEFAULT_SECONDS;
  return Math.floor(parsed);
}
