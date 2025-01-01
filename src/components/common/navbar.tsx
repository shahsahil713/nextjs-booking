"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

export function Navbar({ username }: { username: string }) {
  return (
    <nav className="h-12 border-b bg-white">
      <div className="container h-full mx-auto flex items-center justify-between px-4">
        <div className="font-semibold text-base sm:text-lg truncate">
          Train Ticket Booking
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
            Hello, {username}
          </div>
          <Button
            variant="outline"
            onClick={logout}
            size="sm"
            className="text-xs sm:text-sm"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
