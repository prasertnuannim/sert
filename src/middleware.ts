import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auths/auth";

export async function middleware(req: NextRequest) {
  const session = await auth();

  if (
    ["/profile", "/admin", "/dashboard"
    ].some((path) =>
      req.nextUrl.pathname.startsWith(path)
    ) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }


  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (session?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/login", "/dashboard"],
};
