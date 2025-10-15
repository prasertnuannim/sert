"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/form/Loading";

type Role = "admin" | "user" | "doctor" | "nurse" | "guest" | string;

export default function ClientRedirect({
  role,
  delay = 800,
}: {
  role: Role;
  delay?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      switch (role?.toLowerCase()) {
        case "admin":
          router.push("/account");
          break;
        case "user":
          router.push("/dashboard");
          break;
        case "doctor":
          router.push("/doctor");
          break;
        case "nurse":
          router.push("/schedule");
          break;
        default:
          router.push("/");
          break;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [role, delay, router]);

  return (
    <Loading/>
  );
}
