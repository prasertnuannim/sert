"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/form/Loading";
import { resolveRoleRedirectPath } from "@/lib/auth/access-role";

const REDIRECT_DELAY_MS = 800;

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const targetPath = useMemo(() => {
    if (status === "authenticated") {
      return resolveRoleRedirectPath(session?.user?.role ?? undefined);
    }
    if (status === "unauthenticated") {
      return "/login";
    }
    return null;
  }, [status, session?.user?.role]);

  useEffect(() => {
    if (!targetPath) return;
    const timer = setTimeout(() => {
      router.push(targetPath);
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [router, targetPath]);

  return <Loading />;
}
