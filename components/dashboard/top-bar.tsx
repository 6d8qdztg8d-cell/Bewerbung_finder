"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

type Props = {
  user: Session["user"];
};

export function TopBar({ user }: Props) {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">{user.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Abmelden
        </button>
      </div>
    </header>
  );
}
