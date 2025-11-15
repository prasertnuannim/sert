import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Passkey from "next-auth/providers/passkey";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/server/db/prisma";
import { resolveAuthRedirect } from "./redirect-helpers";

// ---- augment types ----
declare module "next-auth" {
  interface Session {
    user?: {
      role?: string | null;
      id?: string;
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
} from "@/lib/auth/roles";
export { AUTH_REDIRECT_PATH, resolveAuthRedirect } from "./redirect-helpers";

const adapter = PrismaAdapter(prisma);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter,
  session: {
    strategy: "jwt",
    maxAge: 60 * 50, // 50 นาที
  },
  experimental: { enableWebAuthn: true },
  pages: { signIn: "/login" },

  providers: [
    GitHub,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Passkey,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(String(credentials.password), String(user.password));
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.name ?? user.roleId ?? null,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account?.provider) return false;
      if (account.provider === "credentials") return true;

      const existingUser = await prisma.user.findUnique({ where: { email: user.email } });

      if (existingUser) {
        // update image ถ้ายังไม่มี
        if (!existingUser.image && user.image) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { image: user.image },
          });
        }

        // link provider ถ้ายังไม่มี
        const linked = await prisma.account.findFirst({
          where: { userId: existingUser.id, provider: account.provider },
        });
        if (!linked) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              id_token: account.id_token,
              token_type: account.token_type,
              scope: account.scope,
              session_state: account.session_state ? String(account.session_state) : undefined,
            },
          });
        }
      } else {
        // สร้าง user ใหม่
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name,
            image: user.image,
            role: { connect: { name: "user" } },
            accounts: {
              create: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                id_token: account.id_token,
                token_type: account.token_type,
                scope: account.scope,
                session_state: account.session_state ? String(account.session_state) : undefined,
              },
            },
          },
        });
      }

      return true;
    },

    async jwt({ token, user, account }) {
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
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      return resolveAuthRedirect({ url, baseUrl });
    },
  },
});
