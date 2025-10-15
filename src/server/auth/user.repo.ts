import { prisma } from "@/server/db/prisma";

export async function findOrCreateUserWithOAuth(user: any, account: any) {
  const existingUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (existingUser) {
    // อัปเดตรูปถ้ายังไม่มี
    if (!existingUser.image && user.image) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { image: user.image },
      });
    }

    // ลิงก์บัญชี provider ถ้ายังไม่มี
    const linked = await prisma.account.findFirst({
      where: { userId: existingUser.id, provider: account.provider },
    });

    if (!linked) {
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          provider: account.provider,
          providerAccountId: account.providerAccountId!,
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

    return existingUser;
  }

  // ถ้าไม่เจอ user → สร้างใหม่ (default role=user)
  return prisma.user.create({
    data: {
      email: user.email!,
      name: user.name,
      image: user.image,
      role: { connect: { name: "user" } },
      accounts: {
        create: {
          provider: account.provider,
          providerAccountId: account.providerAccountId!,
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
