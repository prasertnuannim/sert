import { GoogleSignIn } from "@/components/auth/GoogleSignIn";
import { GithubSignIn } from "@/components/auth/GithubSignIn";
import LoginForm from "./loginForm";
import PasskeySignIn from "@/components/auth/PasskeySignIn";

export default function LoginPage() {
  return (
    <main
      id="main-content"
      className="
        relative flex items-center justify-center
        min-h-dvh supports-[min-height:100dvh]:min-h-[100dvh]
        p-4 sm:p-6
      "
    >
      {/* subtle vignette for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/10 dark:to-black/30" />

      <div className="relative z-10 w-full max-w-4xl">
        <header className="px-4 sm:px-6 pt-2 sm:pt-4 pb-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Login
          </h1>
        </header>

        <div
          className="
            rounded-2xl border border-black/5 dark:border-white/10
            bg-white/70 dark:bg-neutral-900/60
            backdrop-blur-md shadow-xl
            overflow-hidden flex flex-col md:flex-row
          "
        >
          {/* Left: Social login */}
          <div className="flex flex-col justify-center gap-4 bg-neutral-900 text-white p-6 md:p-8 w-full md:w-1/2">
            <h2 className="text-xl sm:text-2xl font-semibold">Login with Social</h2>

            <GoogleSignIn />
            <GithubSignIn />
            <PasskeySignIn />
            
            <p className="mt-2 text-xs text-white/70">
              By logging in, you agree to our Terms of Service.
            </p>
          </div>

          {/* Right: Form */}
          <div className="flex flex-col justify-center gap-4 p-6 md:p-8 w-full md:w-1/2">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
