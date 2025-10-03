import { DefaultSession } from "next-auth";

// 🔹 ขยาย Session / User
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string | null;
    image?: string | null;
  }
}

// 🔹 ขยาย JWT
import "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    picture?: string | null;
    email?: string | null;
  }
}
