"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "./action";
import { AuthFormState } from "@/types/auth.type";
import FormInput from "@/components/form/FormInput";
import { SubmitButton } from "@/components/form/SubmitButton";
import FormAlert from "@/components/form/FormAlert";

export default function RegisterForm() {
  const router = useRouter();

  const initialState: AuthFormState = {
    errors: {},
    values: { name: "", email: "", password: "", confirmPassword: "" },
  };

  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  useEffect(() => {
    const form = document.querySelector("form") as HTMLFormElement | null;

    if (state.success) {
      if (form) form.reset();
      setTimeout(() => router.push("/login"), 1500);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <FormInput
        name="name"
        type="text"
        label="Username"
        placeholder="Enter your username"
        defaultValue={state.values?.name}
        error={state.errors?.name}
      />

      <FormInput
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />

      <FormInput
        name="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        defaultValue={state.values?.password}
        error={state.errors?.password}
      />

      <FormInput
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        defaultValue={state.values?.confirmPassword}
        error={state.errors?.confirmPassword}
      />

      <SubmitButton text="Register" isPending={isPending} />

      {state.errors?.general && (
        <FormAlert message={state.errors.general} variant="error" />
      )}
      {state.success && (
        <FormAlert message="Registration successful!" variant="success" />
      )}

      <p className="text-center text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-gray-800 hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}
