"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-bold">Trello Pro</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
