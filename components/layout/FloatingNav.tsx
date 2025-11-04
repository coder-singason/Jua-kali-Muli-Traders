"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Menu, X, Home, Package, Settings, Heart } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function FloatingNav() {
  const { data: session } = useSession();
  const itemCount = useCartStore((state) => state.getItemCount());
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      const root = document.documentElement;
      const isDarkMode = root.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkDarkMode();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop Navigation - Bottom Floating */}
      <nav className="hidden md:block fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3 shadow-lg backdrop-blur-md">
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all",
                isActive("/") && "bg-primary text-primary-foreground"
              )}
              aria-label="Home"
            >
              <Home className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/products">
            <Button
              variant={isActive("/products") ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all",
                isActive("/products") && "bg-primary text-primary-foreground"
              )}
              aria-label="Products"
            >
              <Package className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button
              variant={isActive("/cart") ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full transition-all",
                isActive("/cart") && "bg-primary text-primary-foreground"
              )}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
          </Link>

          {session && (
            <Link href="/wishlist">
              <Button
                variant={isActive("/wishlist") ? "default" : "ghost"}
                size="icon"
                className={cn(
                  "h-10 w-10 rounded-full transition-all",
                  isActive("/wishlist") && "bg-primary text-primary-foreground"
                )}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {session ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link href="/admin/dashboard">
                  <Button
                    variant={isActive("/admin") ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-full transition-all",
                      isActive("/admin") && "bg-primary text-primary-foreground"
                    )}
                    aria-label="Admin Dashboard"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button
                  variant={isActive("/profile") ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full transition-all",
                    isActive("/profile") && "bg-primary text-primary-foreground"
                  )}
                  aria-label="Profile"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 rounded-full px-4"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="h-10 rounded-full px-4">
                  Register
                </Button>
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile Navigation - Simplified Bottom Bar (only essential items) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/95 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                isActive("/") && "bg-primary text-primary-foreground"
              )}
              aria-label="Home"
            >
              <Home className="h-5 w-5" />
            </Button>
            <span className={cn("text-[10px] font-medium", isActive("/") && "text-primary")}>
              Home
            </span>
          </Link>

          <Link href="/products" className="flex-1 flex flex-col items-center gap-1 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                isActive("/products") && "bg-primary text-primary-foreground"
              )}
              aria-label="Products"
            >
              <Package className="h-5 w-5" />
            </Button>
            <span className={cn("text-[10px] font-medium", isActive("/products") && "text-primary")}>
              Products
            </span>
          </Link>

          <Link href="/cart" className="flex-1 flex flex-col items-center gap-1 py-1.5 relative">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                isActive("/cart") && "bg-primary text-primary-foreground"
              )}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
            <span className={cn("text-[10px] font-medium", isActive("/cart") && "text-primary")}>
              Cart
            </span>
          </Link>

          {session?.user.role === "ADMIN" && (
            <Link href="/admin/dashboard" className="flex-1 flex flex-col items-center gap-1 py-1.5">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-lg transition-all",
                  isActive("/admin") && "bg-primary text-primary-foreground"
                )}
                aria-label="Admin"
              >
                <Settings className="h-5 w-5" />
              </Button>
              <span className={cn("text-[10px] font-medium", isActive("/admin") && "text-primary")}>
                Admin
              </span>
            </Link>
          )}

          <Link href={session ? "/profile" : "/login"} className="flex-1 flex flex-col items-center gap-1 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg transition-all",
                isActive("/profile") && "bg-primary text-primary-foreground"
              )}
              aria-label={session ? "Profile" : "Login"}
            >
              <User className="h-5 w-5" />
            </Button>
            <span className={cn("text-[10px] font-medium", isActive("/profile") && "text-primary")}>
              {session ? "Profile" : "Login"}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
}
