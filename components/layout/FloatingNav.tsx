"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, User, LogOut, Menu, X, Home, Package, Settings, Heart, MoreVertical } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function FloatingNav() {
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
    <>
      {/* Mobile/Tablet Navigation - Floating bottom bar with More menu */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-card/95 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-around px-1 py-1.5 safe-area-bottom">
          <Link href="/" className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-md transition-all",
                isActive("/") && "bg-primary text-primary-foreground"
              )}
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Button>
            <span className={cn("text-xs font-medium truncate max-w-full", isActive("/") && "text-primary")}>
              Home
            </span>
          </Link>

          <Link href="/products" className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-md transition-all",
                isActive("/products") && "bg-primary text-primary-foreground"
              )}
              aria-label="Products"
            >
              <Package className="h-4 w-4" />
            </Button>
            <span className={cn("text-xs font-medium truncate max-w-full", isActive("/products") && "text-primary")}>
              Products
            </span>
          </Link>

          <Link href="/cart" className="flex flex-col items-center gap-0.5 min-w-0 flex-1 relative">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-md transition-all",
                isActive("/cart") && "bg-primary text-primary-foreground"
              )}
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>
            <span className={cn("text-xs font-medium truncate max-w-full", isActive("/cart") && "text-primary")}>
              Cart
            </span>
          </Link>

          <Link href={session ? "/profile" : "/login"} className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-md transition-all",
                isActive("/profile") && "bg-primary text-primary-foreground"
              )}
              aria-label={session ? "Profile" : "Login"}
            >
              <User className="h-4 w-4" />
            </Button>
            <span className={cn("text-xs font-medium truncate max-w-full", isActive("/profile") && "text-primary")}>
              {session ? "Profile" : "Login"}
            </span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex flex-col items-center gap-0.5 min-w-0 flex-1 py-1.5"
                aria-label="More options"
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center transition-all",
                    "hover:bg-muted active:bg-muted/80"
                  )}
                >
                  <MoreVertical className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Additional options and settings</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {session && session.user.role !== "ADMIN" && (
                  <Link href="/wishlist">
                    <Button
                      variant={isActive("/wishlist") ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                    >
                      <Heart className="h-5 w-5" />
                      <span>Wishlist</span>
                    </Button>
                  </Link>
                )}
                {session?.user.role === "ADMIN" && (
                  <Link href="/admin/dashboard">
                    <Button
                      variant={isActive("/admin") ? "default" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Admin Dashboard</span>
                    </Button>
                  </Link>
                )}
                {session && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </Button>
                )}
                <div className="flex items-center justify-between w-full px-4 py-3 border-t mt-4">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
