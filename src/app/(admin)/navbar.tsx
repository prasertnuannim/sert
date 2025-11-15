import ColorMotionInChar from "@/components/motion/ColorMotionInChar";
import { TooltipButton } from "@/components/ui/tooltipButton";
import { signOut } from "@/server/services/auth/AuthService";
import { getServerAuthSession } from "@/server/services/auth/SessionService";
import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default async function Navbar() {
  const session = await getServerAuthSession();
  return (
    <header className="text-white w-full pl-6">
      <div className="flex flex-wrap items-center justify-between px-6 py-2">
        <div className="font-bold text-md">
          <ColorMotionInChar
            className="text-[28px]"
            colors={["#9accfe", "#007cf9", "#9accfe", ]}
            name="Admin"
          />
        </div>

        {session?.user ? (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right">
              <div className="tracking-[-0.5em] font-bold text-md">
                <ColorMotionInChar
                  className="pl-1 text-[16px]"
                  name={session.user.name ?? "User"}
                />
              </div>
            </div>

            {/* Sign out button */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <TooltipButton label="Logout">
                <FaSignOutAlt />
              </TooltipButton>
            </form>
          </div>
        ) : (
          <div className="text-sm text-red-400">Not logged in</div>
        )}
      </div>
    </header>
  );
}
