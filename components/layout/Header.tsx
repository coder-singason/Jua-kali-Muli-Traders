"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, Package, Heart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session } = useSession();
  const itemCount = useCartStore((state) => state.getItemCount());
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only showing cart badge after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  return (
    <header className="hidden lg:block sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
          prefetch={true}
        >
          <span className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary/70 bg-clip-text text-transparent whitespace-nowrap">
            JUA-KALI MULI TRADERS
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {/* Products Link */}
          <Link href="/products" prefetch={true}>
            <Button
              variant={isActive("/products") ? "default" : "ghost"}
              size="sm"
              className={cn(
                "gap-2 h-9",
                isActive("/products") && "bg-primary text-primary-foreground"
              )}
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </Button>
          </Link>

          {/* Wishlist Link (only for logged-in non-admin users) */}
          {session && session.user.role !== "ADMIN" && (
            <Link href="/wishlist" prefetch={true}>
              <Button
                variant={isActive("/wishlist") ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 h-9",
                  isActive("/wishlist") && "bg-primary text-primary-foreground"
                )}
              >
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
              </Button>
            </Link>
          )}

          {/* Cart Link */}
          <Link href="/cart" prefetch={true}>
            <Button
              variant={isActive("/cart") ? "default" : "ghost"}
              size="sm"
              className={cn(
                "gap-2 h-9 relative",
                isActive("/cart") && "bg-primary text-primary-foreground"
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Cart</span>
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Theme Toggle */}
          <div className="ml-2 pl-2 border-l">
            <ThemeToggle />
          </div>

          {/* User Menu */}
          {session ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <Link href="/profile" prefetch={true}>
                <Button
                  variant={isActive("/profile") ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2 h-9",
                    isActive("/profile") && "bg-primary text-primary-foreground"
                  )}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="gap-2 h-9"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <Link href="/login" prefetch={true}>
                <Button variant="ghost" size="sm" className="gap-2 h-9">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/register" prefetch={true}>
                <Button size="sm" className="gap-2 h-9">
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

