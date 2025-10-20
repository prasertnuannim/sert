import RegisterForm from "./registerForm";

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white shadow-md rounded p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold text-center">Register</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
