import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { GithubSignIn } from "@/components/auth/GithubSignIn";
import LoginForm from "./loginForm";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-50 dark:bg-neutral-950 bg-[url('/images/bg.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="flex flex-col w-full max-w-4xl">
        <div className="px-6 pt-6">
          <h1 className="text-3xl font-bold text-white">LOGIN</h1>
        </div>
        <div className="flex flex-col md:flex-row w-full rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col justify-center gap-4 bg-[#1e1e1e] text-white p-6 md:p-8 w-full md:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Login with Social</h2>
            <GoogleSignIn />
            <GithubSignIn />
            <p className="mt-4 text-xs text-gray-400">
              By logging in, you agree to our Terms of Service.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-4 bg-white dark:bg-neutral-900 p-6 md:p-8 w-full md:w-1/2">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}


