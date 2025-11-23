import type { Account, User as NextAuthUser, User } from "next-auth";
import type { User as PrismaUser, PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { LoginCredentialsInput } from "@/types/auth.type";
import bcrypt from "bcryptjs";

type AuthUser = Pick<NextAuthUser, "email" | "name" | "image"> & { id?: string | null };

const buildAccountBase = (account: Account) => ({
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
});

const buildAccountCreateData = (account: Account) => buildAccountBase(account);

const buildLinkedAccountData = (userId: string, account: Account) => ({
  userId,
  ...buildAccountBase(account),
});

const findUserByEmail = (db: PrismaClient) => (email: string) =>
  db.user.findUnique({ where: { email } });

const updateUserImageIfNeeded =
  (db: PrismaClient) => async (existing: PrismaUser, user: AuthUser): Promise<void> => {
    if (!existing.image && user.image) {
      await db.user.update({
        where: { id: existing.id },
        data: { image: user.image },
      });
    }
  };

const linkAccountIfNeeded =
  (db: PrismaClient) => async (existing: PrismaUser, account: Account): Promise<void> => {
    const linked = await db.account.findFirst({
      where: { userId: existing.id, provider: account.provider },
    });

    if (!linked) {
      await db.account.create({
        data: buildLinkedAccountData(existing.id, account),
      });
    }
  };

const createUserWithOAuth =
  (db: PrismaClient) => async (user: AuthUser, account: Account): Promise<PrismaUser> =>
    db.user.create({
      data: {
        email: user.email!,
        name: user.name,
        image: user.image,
        role: { connect: { name: "user" } },
        accounts: {
          create: buildAccountCreateData(account),
        },
      },
    });

const normalizeCredentials = (
  credentials?: Partial<Record<"email" | "password", unknown>>,
): LoginCredentialsInput | undefined => {
  if (!credentials) return undefined;
  return {
    email: typeof credentials.email === "string" ? credentials.email : undefined,
    password: typeof credentials.password === "string" ? credentials.password : undefined,
  };
};

const authorizeWithCredentials = async (
  credentials?: Partial<Record<"email" | "password", unknown>>,
): Promise<User | null> => {
  const normalized = normalizeCredentials(credentials);
  const email = normalized?.email;
  const password = normalized?.password;
  if (!email || !password) return null;

  const user = await prisma.user.findFirst({
    where: { email },
    include: { role: true },
  });
  if (!user || !user.password) return null;

  const ok = await bcrypt.compare(password, String(user.password));
  if (!ok) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role?.name ?? user.roleId ?? null,
    image: user.image,
  };
};

export const createAuthUserService = (db: PrismaClient = prisma) => {
  const findByEmail = findUserByEmail(db);
  const updateImage = updateUserImageIfNeeded(db);
  const linkAccount = linkAccountIfNeeded(db);
  const createUser = createUserWithOAuth(db);

  const findOrCreate = async (user: AuthUser, account: Account): Promise<PrismaUser> => {
    if (!user.email) {
      throw new Error("OAuth user is missing email");
    }

    const existing = await findByEmail(user.email);

    if (existing) {
      await updateImage(existing, user);
      await linkAccount(existing, account);
      return existing;
    }

    return createUser(user, account);
  };

  return { findOrCreate };
};

export const authUserService = createAuthUserService();
export const authorizeWithCredentialsService = authorizeWithCredentials;
