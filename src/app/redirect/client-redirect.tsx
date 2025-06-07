"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../loading/page";

export default function ClientRedirect({ role }: { role: string }) {
  const router = useRouter();
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (role === "admin") router.push("/profile");
      else if (role === "user") router.push("/dashboard");
      else router.push("/");
    }, 1000);
    return () => clearTimeout(timeout);
  }, [role, router]);
  return <Loading message="Redirecting..." />;
}
