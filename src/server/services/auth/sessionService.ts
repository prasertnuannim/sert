import "server-only";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { auth } from "./AuthService";

type AuthWithRequest = (req: NextRequest) => Promise<Session | null>;

export class SessionService {
  static async get(request?: NextRequest): Promise<Session | null> {
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
  }

  static async user(request?: NextRequest) {
    const session = await this.get(request);
    return session?.user ?? null;
  }

  static async isAuthenticated(request?: NextRequest) {
    const user = await this.user(request);
    return !!user?.id;
  }

  static async hasRole(role: string, request?: NextRequest) {
    const user = await this.user(request);
    return user?.role === role;
  }
}

/** ✅ ใช้ใน Server Component หรือ API Route */
export async function getServerAuthSession(request?: NextRequest): Promise<Session | null> {
  return SessionService.get(request);
}

/** ✅ ดึงเฉพาะ user */
export async function getSessionUser(request?: NextRequest) {
  return SessionService.user(request);
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
