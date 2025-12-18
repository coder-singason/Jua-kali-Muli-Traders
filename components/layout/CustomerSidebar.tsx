"use client";

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
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useSidebar } from "./SidebarContext";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function CustomerSidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((state) => state.getItemCount());

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
    ...(session && session.user.role !== "ADMIN"
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
    <aside
      className={cn(
        "hidden lg:flex fixed top-0 left-0 z-40 h-screen bg-card/95 backdrop-blur-sm border-r border-border/50 transition-all duration-300 ease-in-out shadow-lg",
        "flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border/50">
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
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href} className="block group">
              <div
                className={cn(
                  "relative flex items-center rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center h-12 w-12 mx-auto" : "h-11 gap-3 px-3",
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
      <div className="p-3 border-t border-border/50 space-y-1.5">
        {session ? (
          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
            className={cn(
              "flex items-center rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              isCollapsed ? "justify-center h-12 w-12 mx-auto" : "w-full h-11 gap-3 px-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-medium text-sm transition-all duration-200 whitespace-nowrap">
                Logout
              </span>
            )}
          </button>
        ) : (
          <Link
            href="/login"
            className={cn(
              "block flex items-center rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              isCollapsed ? "justify-center h-12 w-12 mx-auto" : "w-full h-11 gap-3 px-3"
            )}
          >
            <User className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-medium text-sm transition-all duration-200 whitespace-nowrap">
                Login
              </span>
            )}
          </Link>
        )}
        {/* Theme Toggle */}
        <div
          className={cn(
            "flex items-center rounded-lg transition-all duration-200",
            "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            isCollapsed ? "justify-center h-12 w-12 mx-auto" : "w-full h-11 gap-3 px-3"
          )}
        >
          {isCollapsed ? (
            <ThemeToggle />
          ) : (
            <>
              <div className="flex items-center justify-center shrink-0">
                <ThemeToggle />
              </div>
              <span className="font-medium text-sm transition-all duration-200 whitespace-nowrap">
                Theme
              </span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

