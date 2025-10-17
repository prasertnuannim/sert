"use client";

import { useActionState, useEffect } from "react";  // ❌ useEffect ต้อง import จาก react
import { useSearchParams } from "next/navigation"; // ✅ import ให้ถูกที่        // ✅ หรือ lib แจ้งเตือนที่คุณใช้
import { registerUser } from "./action";
import { AuthFormState } from "@/types/auth.type";
import FormInput from "@/components/form/FormInput";
import { SubmitButton } from "@/components/form/SubmitButton";

export default function RegisterPage() {
  // ✅ state เริ่มต้นของฟอร์ม
  const initialState: AuthFormState = {
    errors: {},
    values: { name: "", email: "", password: "", confirmPassword: "" },
  };

  // ✅ ใช้ useActionState ร่วมกับ server action registerUser
  const [state, formAction] = useActionState(registerUser, initialState);

  // ✅ ดึง query param "success" เพื่อตรวจว่า redirect มาจาก register สำเร็จหรือไม่
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  // ✅ แสดง toast เมื่อสมัครสำเร็จ
  useEffect(() => {
   console.log("สมัครสำเร็จ")
  }, [success]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center">Register</h1>

        <form action={formAction} className="space-y-4">
          <FormInput
            name="name"
            type="text"
            label="Username"
            placeholder="Enter your username"
            error={state.errors?.name}
          />
          <FormInput
            name="email"
            type="email"
            label="Email"
            placeholder="Enter your email"
            error={state.errors?.email}
          />
          <FormInput
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={state.errors?.password}
          />
          <FormInput
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm your password"
            error={state.errors?.confirmPassword}
          />

          <SubmitButton text="Register" />

          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-gray-800 hover:underline">
              Login
            </a>
          </p>

          {/* ✅ แสดง error จาก server action */}
          {state.errors?.general && (
            <p className="text-red-500 text-center">{state.errors.general}</p>
          )}
        </form>
      </div>
    </div>
  );
}
