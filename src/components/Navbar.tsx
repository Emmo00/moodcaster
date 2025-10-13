"use client";

import Link from "next/link";
import { useQuickAuth } from "@/hooks/useQuickAuth";

export default function Navbar() {
  const { authenticatedUser } = useQuickAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-4 border-black bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <h1 className="font-mono text-2xl font-black uppercase tracking-tight text-black">MoodCaster</h1>
        
        <div className="flex items-center gap-3">
          {authenticatedUser && (
            <span className="border-2 border-black bg-gray-100 px-3 py-1 font-mono text-sm font-bold text-black">
              @fid{authenticatedUser.fid}
            </span>
          )}
          
          <Link
            href="/profile"
            className="flex items-center gap-2 border-4 border-black bg-yellow-300 px-4 py-2 font-mono font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1 text-black"
          >
            Profile
          </Link>
          
          {/* <button
            onClick={signOut}
            className="border-4 border-black bg-red-300 px-4 py-2 font-mono font-bold uppercase transition-transform hover:translate-x-1 hover:translate-y-1 text-black"
          >
            Sign Out
          </button> */}
        </div>
      </div>
    </nav>
  );
}