"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto justify-between">
        <div className="font-semibold text-lg">Your App</div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
