"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";

export function CustomerSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((state) => state.getItemCount());

  // Handle responsive behavior - auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Home",
    },
    {
      href: "/products",
      icon: Package,
      label: "Products",
    },
    {
      href: "/cart",
      icon: ShoppingCart,
      label: "Cart",
      badge: itemCount > 0 ? itemCount : undefined,
    },
    ...(session
      ? [
          {
            href: "/wishlist",
            icon: Heart,
            label: "Wishlist",
          },
          {
            href: "/profile",
            icon: User,
            label: "Profile",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen bg-card/95 backdrop-blur-sm border-r border-border/50 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none",
          "flex flex-col",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-5 border-b border-border/50">
          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-200",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-lg leading-tight text-foreground">KicksZone</h2>
              <p className="text-xs text-muted-foreground font-medium">
                {session?.user?.name || "Shop"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "ml-auto shrink-0 h-8 w-8 hover:bg-muted/80",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMobileOpen ? (
              <X className="h-4 w-4 text-foreground" />
            ) : isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 lg:p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                className="block group"
              >
                <div
                  className={cn(
                    "relative flex items-center rounded-lg transition-all duration-200",
                    isCollapsed 
                      ? "justify-center h-12 w-12 mx-auto" 
                      : "h-11 gap-3 px-3",
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {/* Active indicator */}
                  {active && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
                  )}

                  <div className="relative flex items-center justify-center shrink-0">
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all",
                        active
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {item.badge && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <span
                      className={cn(
                        "font-medium text-sm transition-all duration-200 flex-1 whitespace-nowrap",
                        active && "text-primary-foreground font-semibold"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50" />

        {/* Footer */}
        <div className="p-2 lg:p-3 border-t border-border/50 space-y-1.5">
          {session ? (
            <>
              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                  closeMobileSidebar();
                }}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  isCollapsed 
                    ? "justify-center h-12 w-12 mx-auto" 
                    : "w-full h-11 gap-3 px-3"
                )}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm transition-all duration-200 whitespace-nowrap">
                    Logout
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={closeMobileSidebar}
                className={cn(
                  "block flex items-center rounded-lg transition-all duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  isCollapsed 
                    ? "justify-center h-12 w-12 mx-auto" 
                    : "w-full h-11 gap-3 px-3"
                )}
              >
                <User className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm transition-all duration-200 whitespace-nowrap">
                    Login
                  </span>
                )}
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-40 lg:hidden h-10 w-10 bg-card/95 backdrop-blur-sm border-border/50 shadow-lg hover:bg-muted/80"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </Button>
    </>
  );
}

