import type { Account, User as NextAuthUser } from "next-auth";
import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

type AuthUser = Pick<NextAuthUser, "email" | "name" | "image"> & { id?: string | null };

export class AuthUserService {
  constructor(private readonly db = prisma) {}
  public async findOrCreate(user: AuthUser, account: Account): Promise<PrismaUser> {
    if (!user.email) {
      throw new Error("OAuth user is missing email");
    }

    const existing = await this.findUserByEmail(user.email);

    if (existing) {
      await this.updateUserImageIfNeeded(existing, user);
      await this.linkAccountIfNeeded(existing, account);
      return existing;
    }

    return this.createUserWithOAuth(user, account);
  }

  private async findUserByEmail(email: string): Promise<PrismaUser | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  private async updateUserImageIfNeeded(existing: PrismaUser, user: AuthUser): Promise<void> {
    if (!existing.image && user.image) {
      await this.db.user.update({
        where: { id: existing.id },
        data: { image: user.image },
      });
    }
  }

  private async linkAccountIfNeeded(existing: PrismaUser, account: Account): Promise<void> {
    const linked = await this.db.account.findFirst({
      where: { userId: existing.id, provider: account.provider },
    });

    if (!linked) {
      await this.db.account.create({
        data: this.buildLinkedAccountData(existing.id, account),
      });
    }
  }

  private async createUserWithOAuth(user: AuthUser, account: Account): Promise<PrismaUser> {
    return this.db.user.create({
      data: {
        email: user.email!,
        name: user.name,
        image: user.image,
        role: { connect: { name: "user" } },
        accounts: {
          create: this.buildAccountCreateData(account),
        },
      },
    });
  }


  private buildAccountCreateData(account: Account) {
    return this.buildAccountBase(account);
  }

  private buildLinkedAccountData(userId: string, account: Account) {
    return {
      userId,
      ...this.buildAccountBase(account),
    };
  }

  private buildAccountBase(account: Account) {
    return {
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
    };
  }
}


