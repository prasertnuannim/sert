import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// Extend NextAuth types to include 'role'
import { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";

declare module "next-auth" {
  interface Session {
    user?: {
      role?: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: string | null;
  }
}
const adapter = PrismaAdapter(prisma);
export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter,
  session: {
    //strategy: "jwt", maxAge: 60 * 60 * 24 * 7, // 7 วัน (ใช้ร่วมกับ jwt)
    strategy: "jwt", maxAge: 60 * 50, // 50นาที = 180 วินาที
  },
  providers: [
    GitHub,
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        name: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.name || !credentials?.password) {
          throw new Error("Missing username or password");
        }

        const user = await prisma.user.findFirst({
          where: { name: credentials.name },
          include: { role: true },
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(String(credentials.password), String(user.password));
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.name ?? user.roleId ?? null,
        };
      },
    }),
  ],
  //session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account?.provider) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        // อัปเดตรูปภาพถ้ายังไม่มี และ user.image มีค่า
        if (!existingUser.image && user.image) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { image: user.image },
          });
        }

        const existingLinkedAccount = await prisma.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: account.provider,
          },
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
        // ยังไม่มี user → สร้างพร้อม account
        await prisma.user.create({
          data: {
            email: user.email,
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

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.image = token.picture as string;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        if (user?.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: { role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role?.name ?? dbUser.roleId ?? null;
            token.picture = dbUser.image;
          }
        }
      }
      if (account?.provider === "credentials" && user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image;
      }
      return token;
    },
    async redirect() {
      return "/redirect";
    },
  },
});
