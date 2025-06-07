"use client";

import { useActionState } from "react";
import { loginUser } from "./action";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SubmitButton } from "@/components/form/SubmitButton";
import FormInput from "@/components/form/FormInput";
import { LoginFormState } from "@/types/auth.type";

export default function LoginForm() {
  const initialState: LoginFormState = {
    errors: {},
    values: { name: "sert", password: "123456" },
  };

  const [state, formAction] = useActionState(loginUser, initialState);
    if (state.success) {
      redirect("/redirect");
    }

  return (
    <form action={formAction} className="space-y-4">
       <h2 className="text-2xl font-bold mb-4">
        Login with Email
      </h2>
      <FormInput
        name="name"
        type="text"
        label="name"
        placeholder="Your name"
        defaultValue={state.values?.name}
        error={state.errors?.name}
      />
      <FormInput
        name="password"
        type="password"
        label="Password"
        placeholder="Your password"
        defaultValue={state.values?.password}
        error={state.errors?.password}
      />
      <SubmitButton text="Login" />
      {state.errors?.general && (
        <p className="text-red-500 text-sm text-center">
          {state.errors.general}
        </p>
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
