"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, LogOut, Menu, X, Home, Package, Settings } from "lucide-react";
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

      {/* Mobile Navigation - Floating Island Style */}
      <nav className="md:hidden fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
        {/* Main Floating Navigation Bar */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg backdrop-blur-md">
          <Link href="/">
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all",
                isActive("/") && "bg-primary text-primary-foreground"
              )}
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/products">
            <Button
              variant={isActive("/products") ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all",
                isActive("/products") && "bg-primary text-primary-foreground"
              )}
              aria-label="Products"
            >
              <Package className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button
              variant={isActive("/cart") ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full transition-all",
                isActive("/cart") && "bg-primary text-primary-foreground"
              )}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
          </Link>

          {session ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link href="/admin/dashboard">
                  <Button
                    variant={isActive("/admin") ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-9 w-9 rounded-full transition-all",
                      isActive("/admin") && "bg-primary text-primary-foreground"
                    )}
                    aria-label="Admin Dashboard"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button
                  variant={isActive("/profile") ? "default" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full transition-all",
                    isActive("/profile") && "bg-primary text-primary-foreground"
                  )}
                  aria-label="Profile"
                >
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full px-3 text-xs"
              >
                Login
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Mobile Menu - Floating Island Expansion */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className={cn(
                "fixed bottom-20 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 transform rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 ease-in-out",
                mobileMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}
              style={{
                backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1 p-4">
                {session && (
                  <>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                          isActive("/admin") && "bg-primary text-primary-foreground"
                        )}
                      >
                        <Settings className="h-5 w-5" />
                        <span className="font-medium">Admin</span>
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                        isActive("/profile") && "bg-primary text-primary-foreground"
                      )}
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: "/" });
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-secondary"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}

                {!session && (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-secondary"
                    >
                      <span className="font-medium">Login</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg bg-primary px-4 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <span className="font-medium">Register</span>
                    </Link>
                  </>
                )}

                <div className="flex items-center justify-between border-t pt-4 px-4">
                  <span className="font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
}
