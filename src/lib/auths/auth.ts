import NextAuth, { DefaultSession } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Passkey from "next-auth/providers/passkey";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getRequestMeta } from "./reqmeta";
import { geolocate } from "./geo";

// ---- augment types (compiled จาก types/next-auth.d.ts) ----
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

const adapter = PrismaAdapter(prisma);

export const { auth, signIn, signOut, handlers } = NextAuth({
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
        const { ip, userAgent } = await getRequestMeta();
        const geo = await geolocate(ip);

        if (!credentials?.email || !credentials?.password) {
          await prisma.loginEvent.create({
            data: { action: "ATTEMPT", success: false, provider: "credentials", email: credentials?.email as string, ip, userAgent, ...geo },
          });
          return null; // ⬅ ห้าม throw
        }

        const user = await prisma.user.findFirst({
          where: { email: credentials.email },
          include: { role: true },
        });
        if (!user || !user.password) {
          await prisma.loginEvent.create({
            data: { action: "ATTEMPT", success: false, provider: "credentials", email: credentials.email as string, ip, userAgent, ...geo },
          });
          return null;
        }

        const ok = await bcrypt.compare(String(credentials.password), String(user.password));
        if (!ok) {
          await prisma.loginEvent.create({
            data: { action: "ATTEMPT", success: false, provider: "credentials", userId: user.id, email: user.email, ip, userAgent, ...geo },
          });
          return null;
        }

        await prisma.loginEvent.create({
          data: { action: "ATTEMPT", success: true, provider: "credentials", userId: user.id, email: user.email, ip, userAgent, ...geo },
        });

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

  events: {
    async signIn({ user, account }) {
      const { ip, userAgent } = await getRequestMeta();
      const geo = await geolocate(ip);
      await prisma.loginEvent.create({
        data: {
          action: "SIGNIN",
          success: true,
          provider: account?.provider ?? "unknown",
          accountId: account?.providerAccountId ?? null,
          userId: user?.id ?? null,
          email: user?.email ?? null,
          ip,
          userAgent,
          ...geo,
        },
      });
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account?.provider) return false;

      // ⬇️ สำคัญ: ข้ามการลิงก์/สร้าง Account สำหรับ credentials
      if (account.provider === "credentials") {
        return true;
      }
      if (!account.providerAccountId) {
        console.warn("[signIn] missing providerAccountId for", account.provider);
        return true;
      }

      const existingUser = await prisma.user.findUnique({ where: { email: user.email } });

      if (existingUser) {
        if (!existingUser.image && user.image) {
          await prisma.user.update({ where: { id: existingUser.id }, data: { image: user.image } });
        }
        const existingLinkedAccount = await prisma.account.findFirst({
          where: { userId: existingUser.id, provider: account.provider },
        });
        if (!existingLinkedAccount) {
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

      if (account?.provider === "github" || account?.provider === "google" || account?.provider === "passkey") {
        if (user?.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role?.name ?? dbUser.roleId ?? null;
            token.picture = dbUser.image ?? token.picture ?? null;
          }
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

    async redirect() {
      return "/redirect";
    },
  },
});
