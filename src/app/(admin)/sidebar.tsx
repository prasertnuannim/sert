"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Settings, User } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: <User size={20} />, label: "Accounts", href: "/account" },
    { icon: <Settings size={20} />, label: "Settings", href: "/setting" },
  ];
  console.log("isExpanded>>", isExpanded);
  return (
    <div
      className={clsx(
        "h-screen bg-gray-800 text-white transition-all duration-300 flex flex-col",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4 overflow-visible">
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
          className=" z-10 -left-1 p-1 rounded-full text-white hover:bg-gray-200 hover:text-gray-800 transition-colors"
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
              className={`group relative flex ${!isExpanded ? "items-center justify-center" : ""}  gap-4 px-3 py-2 hover:bg-gray-700 rounded transition-colors`}
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
