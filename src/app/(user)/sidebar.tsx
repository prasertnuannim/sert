import React from 'react'

export default function sidebar() {
  return (
      <aside className="hidden lg:block bg-gray-900 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Navigation</h2>
        <nav className="space-y-2 text-sm">
          <a href="/dashboard" className="block hover:text-gray-300">
            Home
          </a>
          <a href="/dashboard/stats" className="block hover:text-gray-300">
            Stats
          </a>
          <a href="/dashboard/settings" className="block hover:text-gray-300">
            Settings
          </a>
        </nav>
      </aside>
    )
}
