
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auths/auth";

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

function extractIp(req: NextRequest): string | null {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") || 
    h.get("true-client-ip") ||  
    h.get("x-real-ip") || 
    (h.get("x-forwarded-for")?.split(",")[0].trim()) ||
    h.get("x-client-ip") ||
    h.get("fly-client-ip") ||
    null
  );
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // ---- inject IP ----
  let ip = extractIp(req);
  if (ip === "::1" || ip === "127.0.0.1") {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const j: { ip: string } = await res.json();
      ip = j.ip;
    } catch {
      ip = null;
    }
  }

  const requestHeaders = new Headers(req.headers);
  if (ip) requestHeaders.set("x-client-ip", ip);

  const matched = matchProtected(pathname);
  if (!matched) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const session = await auth(); 
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

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
