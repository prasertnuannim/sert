import { headers } from "next/headers";

export async function getRequestMeta() {
  const h = await headers();
  const ip = h.get("x-client-ip") || null;
  const userAgent = h.get("user-agent") || null;

  return { ip, userAgent };
}
