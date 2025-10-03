"use client";

import { signIn as webauthnSignIn } from "next-auth/webauthn";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

type Props = { redirectTo?: string };

export default function PasskeySignIn({ redirectTo = "/dashboard" }: Props) {
  return (
    <Button
      type="button"
      className="w-full"
      onClick={() => webauthnSignIn("passkey", { redirectTo })}
      aria-label="Sign in with Passkey"
      title="Sign in with Passkey"
    >
      <KeyRound className="w-4 h-4 mr-2" />
      Sign in with Passkey
    </Button>
  );
}
