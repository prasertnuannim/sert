
import { Button } from "@/components/ui/button";
import { signIn } from "@/server/services/auth/AuthService";
import { FcGoogle } from "react-icons/fc"; 

export const GoogleSignIn = () => {
  return (
    <form
          action={async () => {
            "use server";
             await signIn("google");
          }}
        >
          <Button
            className="w-full text-black bg-white/30 hover:bg-white/40 transition"
            variant="outline"
          >
            <FcGoogle className="w-4 h-4 mr-2 text-black" />
            Continue with GitHub
          </Button>
        </form>
  );
};
