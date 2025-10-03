// app/actions/getLoginEvents.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getLoginEvents() {
  return await prisma.loginEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
