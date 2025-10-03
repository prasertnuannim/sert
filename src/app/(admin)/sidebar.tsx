"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, User, Map } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: <User size={20} />, label: "Accounts", href: "/account" },
    { icon: <Map size={20} />, label: "Login Map", href: "/login-map" },
  ];
  
  return (
    <div
      className={clsx(
        "h-screen bg-gray-800 text-white transition-all duration-300 flex flex-col",
        isExpanded ? "w-54" : "w-16"
      )}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between py-3 px-1 verflow-visible">
        <span
          className={clsx(
            "text-xl font-bold transition-opacity",
            !isExpanded && "opacity-0"
          )}
        >
          MyApp
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className=" z-10 p-1 rounded-full text-white hover:bg-gray-200 hover:text-gray-800 transition-colors"
        >
          {isExpanded ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </div>

      {/* Menu Items */}
      <ul className="flex-1 space-y-2 mt-4 px-2">
        {menuItems.map((item, i) => (
          <li key={i}>
            <Link
              href={item.href}
              className={clsx(
                "group relative flex gap-4 px-3 py-2 hover:bg-gray-700 rounded transition-colors",
                !isExpanded && "items-center justify-center",
                pathname === item.href && "bg-gray-700 font-semibold"
              )}
            >
              {item.icon}
              {isExpanded && <span>{item.label}</span>}

              {/* Tooltip when collapsed */}
              {!isExpanded && (
                <span className="absolute left-full ml-2 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded z-10 whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
