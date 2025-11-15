"use client";

import { useActionState } from "react";
import { loginUser } from "./action";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SubmitButton } from "@/components/form/SubmitButton";
import FormInput from "@/components/form/FormInput";
import { LoginFormState } from "@/types/auth.type";
import FormAlert from "@/components/form/FormAlert";

export default function LoginForm() {
  const initialState: LoginFormState = {
    errors: {},
    values: { email: "admin@example.com", password: "admin123" },
  };

  const [state, formAction, isPending] = useActionState(loginUser, initialState);
  if (state.success) {
    redirect("/");
  }

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Login with Email</h2>
      <FormInput
        name="email"
        type="email"
        label="Email"
        placeholder="Your email"
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />
      <FormInput
        name="password"
        type="password"
        label="Password"
        placeholder="Your password"
        defaultValue={state.values?.password}
        error={state.errors?.password}
      />
      <SubmitButton text="Login" isPending={isPending} />

      {state.errors?.general && (
        <FormAlert
          variant="error"
          title="Login failed"
          message={state.errors?.general}
        />
      )}

      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-4">
        <Link href="/forgot-password" className="hover:underline">
          Forgot Password?
        </Link>
        <Link href="/register" className="hover:underline">
          Register here
        </Link>
      </div>
    </form>
  );
}
