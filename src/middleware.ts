import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { AccessRole, normalizeAccessRole, resolveRoleRedirectPath } from "@/lib/auth/roles";
import { resolveAuthRedirect } from "./server/auth/redirect-helpers";
import { getServerAuthSession } from "./server/auth/session";

const ACCESS_RULES: Record<string, AccessRole[]> = {
  "/admin": [AccessRole.Admin],
  "/account": [AccessRole.Admin],
  "/setting": [AccessRole.Admin],
  "/dashboard": [AccessRole.Admin, AccessRole.User],
};

function matchProtected(pathname: string) {
  return Object.keys(ACCESS_RULES).find(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const matched = matchProtected(pathname);
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing NEXTAUTH_SECRET for middleware getToken");
  }
  const token = await getToken({ req, secret });

  if (!matched) {
    if (pathname === "/") {
      const redirectPath = resolveRoleRedirectPath(token?.role);
      if (redirectPath !== "/") {
        const target = resolveAuthRedirect({
          url: redirectPath,
          baseUrl: req.nextUrl.origin,
        });
        return NextResponse.redirect(new URL(target, req.nextUrl.origin));
      }
    }
    return NextResponse.next();
  }
  const session = await getServerAuthSession();
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  const allowed = ACCESS_RULES[matched];
  const sessionRole = normalizeAccessRole(session.user?.role);
  if (!sessionRole || !allowed.includes(sessionRole)) {
    const fallback = resolveAuthRedirect({
      url: resolveRoleRedirectPath(token?.role),
      baseUrl: req.nextUrl.origin,
    });
    return NextResponse.redirect(new URL(fallback, req.nextUrl.origin));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
