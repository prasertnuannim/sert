import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerAuthSession } from "./server/auth/session";

const ACCESS_RULES: Record<string, string[]> = {
  "/admin": ["admin"],
  "/account": ["admin"],
  "/setting": ["admin"],
  "/dashboard": ["admin", "user"],
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
  if (!matched) return NextResponse.next();
  const session = await getServerAuthSession();
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  const role = session.user?.role ?? "";
  const allowed = ACCESS_RULES[matched];
  if (!allowed.includes(role)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
