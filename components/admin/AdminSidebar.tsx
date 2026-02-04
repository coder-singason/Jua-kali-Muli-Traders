"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Box,
  ShoppingCart,
  Layers,
  MessageSquare,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    icon: BarChart3,
    label: "Dashboard",
  },
  {
    href: "/admin/products",
    icon: Box,
    label: "Products",
  },
  {
    href: "/admin/orders",
    icon: ShoppingCart,
    label: "Orders",
  },
  {
    href: "/admin/categories",
    icon: Layers,
    label: "Categories",
  },
  {
    href: "/admin/reviews",
    icon: MessageSquare,
    label: "Reviews",
  },
];

export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

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
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-lg leading-tight text-foreground">Admin Panel</h2>
              <p className="text-xs text-muted-foreground font-medium">JUA-KALI MULI TRADERS</p>
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                className="block group"
              >
                <div
                  className={cn(
                    "relative flex items-center rounded-xl transition-all duration-200",
                    isCollapsed
                      ? "justify-center h-12 w-12 mx-auto"
                      : "h-12 gap-3 px-4",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary-foreground rounded-r-full" />
                  )}

                  <div
                    className={cn(
                      "flex items-center justify-center shrink-0 transition-all",
                      isCollapsed ? "w-full h-full" : "w-6 h-6",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  {!isCollapsed && (
                    <span
                      className={cn(
                        "font-semibold text-sm transition-all duration-200 flex-1 whitespace-nowrap",
                        isActive && "text-primary-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  )}

                  {item.badge && !isCollapsed && (
                    <span
                      className={cn(
                        "ml-auto text-xs font-bold px-2 py-0.5 rounded-full shrink-0 min-w-[20px] text-center",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50" />

        {/* Footer */}
        <div className="p-2 lg:p-3 border-t border-border/50">
          <Link href="/" onClick={closeMobileSidebar} className="block group">
            <div
              className={cn(
                "flex items-center rounded-lg transition-all duration-200",
                "border border-border/50 hover:border-border hover:bg-muted/60",
                "text-muted-foreground hover:text-foreground",
                isCollapsed
                  ? "justify-center h-12 w-12 mx-auto border-0"
                  : "h-11 gap-3 px-3"
              )}
            >
              <Home
                className={cn(
                  "shrink-0 text-muted-foreground group-hover:text-foreground transition-colors",
                  isCollapsed ? "h-5 w-5" : "h-5 w-5"
                )}
              />
              {!isCollapsed && (
                <span className="font-medium text-sm transition-all duration-200 whitespace-nowrap">
                  Back to Shop
                </span>
              )}
            </div>
          </Link>
          {/* Theme Toggle */}
          <div
            className={cn(
              "flex items-center rounded-lg transition-all duration-200 mt-2",
              "border border-border/50 hover:border-border hover:bg-muted/60",
              "text-muted-foreground hover:text-foreground",
              isCollapsed
                ? "justify-center h-12 w-12 mx-auto border-0"
                : "h-11 gap-3 px-3"
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

