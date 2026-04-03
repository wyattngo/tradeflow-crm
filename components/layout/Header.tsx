"use client";

import { useSession, signOut } from "next-auth/react";
import { AlertBell } from "./AlertBell";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-60 right-0 z-30 h-16 bg-[#141414] border-b border-[#2a2a2a] flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <AlertBell />
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-zinc-200">
              {session?.user?.name ?? "User"}
            </p>
            <p className="text-xs text-zinc-500">
              {(session?.user as any)?.role ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1.5 rounded border border-[#2a2a2a] hover:border-zinc-600 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}
