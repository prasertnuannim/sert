import type { NextAuthResult } from "next-auth";
type AuthFn = NextAuthResult["auth"];
type Params = Parameters<AuthFn>;
type FirstParam = Params[0];
