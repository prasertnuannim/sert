import NextAuth, { DefaultSession, type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Passkey from "next-auth/providers/passkey";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db/prisma";
import type { JWT } from "next-auth/jwt";
import type {
  AuthCallbacks,
  AuthJwtCallbackParams,
  AuthSessionCallbackParams,
  AuthSignInCallbackParams,
} from "@/types/auth.type";
import {
  authUserService,
  authorizeWithCredentialsService,
} from "@/server/services/auth/authUserService";
import { resolveSessionMaxAgeSeconds } from "@/server/services/auth/sessionService";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    picture?: string | null;
    email?: string | null;
  }
}

export {
  AccessRole,
  ROLE_REDIRECT_MAP,
  resolveRoleRedirectPath,
  normalizeAccessRole,
} from "@/lib/auth/accessRole";

const adapter = PrismaAdapter(prisma);
const enableWebAuthn = ["1", "true", "yes"].includes(
  String(process.env.NEXT_PUBLIC_ENABLE_PASSKEY ?? "").toLowerCase(),
);

const providers = (): NextAuthConfig["providers"] => {
  const providerList: NextAuthConfig["providers"] = [
    GitHub,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeWithCredentialsService,
    }),
  ];

  if (enableWebAuthn) providerList.splice(2, 0, Passkey);

  return providerList;
};

const handleSignIn: AuthCallbacks["signIn"] = async ({ user, account }: AuthSignInCallbackParams) => {
  if (!user.email || !account?.provider) return false;
  if (account.provider === "credentials") return true;
  await authUserService.findOrCreate(
    { id: user.id, email: user.email, name: user.name, image: user.image },
    account,
  );

  return true;
};

const handleJWT: AuthCallbacks["jwt"] = async ({
  token,
  user,
  account,
}: AuthJwtCallbackParams): Promise<JWT> => {
  if (user) token.email = user.email ?? token.email;

  if (account?.provider && ["github", "google", "passkey"].includes(account.provider)) {
    const dbUser = await prisma.user.findUnique({
      where: { email: user?.email ?? "" },
      include: { role: true },
    });
    if (dbUser) {
      token.id = dbUser.id;
      token.role = dbUser.role?.name ?? dbUser.roleId ?? null;
      token.picture = dbUser.image ?? token.picture ?? null;
    }
  }

  if (account?.provider === "credentials" && user) {
    token.id = user.id;
    token.role = user.role ?? null;
    token.picture = user.image ?? null;
  }

  return token;
};

const handleSession: AuthCallbacks["session"] = async ({
  session,
  token,
}: AuthSessionCallbackParams) => {
  if (session.user) {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
    session.user.image = (token.picture as string) ?? session.user.image;
  }
  return session;
};

const callbacks = (): AuthCallbacks => ({
  signIn: handleSignIn,
  jwt: handleJWT,
  session: handleSession,
  redirect: async () => "/",
});

const getAuthOptions = (): NextAuthConfig => ({
  secret: process.env.NEXTAUTH_SECRET,
  adapter,
  session: {
    strategy: "jwt",
    maxAge: resolveSessionMaxAgeSeconds(process.env.SESSION_MAX_AGE),
  },
  experimental: enableWebAuthn ? { enableWebAuthn: true } : undefined,
  pages: { signIn: "/login" },
  providers: providers(),
  callbacks: callbacks(),
});

export const { handlers, auth, signIn, signOut } = NextAuth(getAuthOptions);
