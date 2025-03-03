"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider"; // Import auth context
import { useState } from "react";
import { Plus, Rocket } from "lucide-react"; // Updated icons
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StripeCheckout } from "@/components/billing/StripeCheckout"; // Stripe integration

export default function Header() {
  const { user, logout } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-sm shadow-sm dark:bg-gray-950/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Rocket className="h-6 w-6" />
          <span className="text-lg font-bold">Bleepo</span>
        </Link>

        {/* Navigation / Auth Actions */}
        <nav className="hidden space-x-6 md:flex">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Credits: {user.call_credits}
              </span>
              {/* Add Credits Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Buy More Credits</DialogTitle>
                  </DialogHeader>
                  <StripeCheckout onClose={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
              <button
                onClick={logout}
                className="text-sm font-medium hover:text-red-600 dark:hover:text-red-400"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium hover:text-gray-900 dark:hover:text-gray-50"
              prefetch={false}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
