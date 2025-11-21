
import { Button } from "@/components/ui/button";
import { signIn } from "@/server/services/auth/authService";
import { FaGithub } from "react-icons/fa";

export const GithubSignIn = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button
        className="w-full text-black bg-white/30 hover:bg-white/40 transition"
        variant="outline"
      >
        <FaGithub className="w-4 h-4 mr-2 text-black" />
        Continue with GitHub
      </Button>
    </form>
  );
};
