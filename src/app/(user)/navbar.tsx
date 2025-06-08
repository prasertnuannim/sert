import ColorMotionInChar from "@/components/motion/ColorMotionInChar";
import { TooltipButton } from "@/components/ui/tooltipButton";
import { auth, signOut } from "@/lib/auths/auth";
import React from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default async function navbar() {
  const session = await auth();
  return (
    <header className="bg-gray-800 text-white w-full">
      <div className="max-w-screen flex flex-wrap items-center justify-between px-6 py-2">
        <div className="font-bold text-md">
          <ColorMotionInChar
            className="pl-1 text-[28px]"
            colors={["#FF5733", "#33FF57", "#3357FF", "#F0F"]}
            name="Dashboard"
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
              {/* <button
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-lg flex items-center space-x-2"
                title="Logout"
              >
                <FaSignOutAlt />
              </button> */}
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
