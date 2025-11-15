"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/form/Loading";
import { AccessRole, resolveRoleRedirectPath } from "@/lib/auth/roles";

export default function ClientRedirect({
  role,
  delay = 800,
}: {
  role: AccessRole | string | null | undefined;
  delay?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(resolveRoleRedirectPath(role));
    }, delay);

    return () => clearTimeout(timer);
  }, [role, delay, router]);

  return (
    <Loading/>
  );
}
