"use client";

import { signIn as webauthnSignIn } from "next-auth/webauthn";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

type Props = { redirectTo?: string; className?: string };

export default function PasskeyRegister({ redirectTo = "/account/security", className }: Props) {
  const { status } = useSession();
  if (status !== "authenticated") return null;

  return (
    <Button
      type="button"
      className={className}
      onClick={() => webauthnSignIn("passkey", { action: "register", redirectTo })}
      aria-label="Register a new Passkey"
      title="Register a new Passkey"
    >
      <KeyRound className="w-4 h-4 mr-2" />
      Register new Passkey
    </Button>
  );
}
