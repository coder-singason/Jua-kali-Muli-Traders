"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Package, ShoppingBag, User, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext } from "react";
import { SidebarContext } from "./SidebarContext";

export function Footer() {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  // Safely get sidebar context (might not be available on all pages)
  const sidebarContext = useContext(SidebarContext);
  const isCollapsed = sidebarContext?.isCollapsed ?? false;
  
  // Check if we're on a shop page (sidebar visible)
  const isShopPage = !pathname?.startsWith("/admin") && !pathname?.startsWith("/login") && !pathname?.startsWith("/register");
  
  // Account for sidebar width on desktop shop pages
  const footerPadding = isShopPage 
    ? (isCollapsed ? "lg:pl-16" : "lg:pl-64")
    : "";

  return (
    <footer className={cn("border-t bg-card mt-auto transition-all duration-300", footerPadding)}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-3 text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              KicksZone
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium shoes for every step of your journey.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Shop
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-muted-foreground hover:text-foreground transition-colors">
                  Featured
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              {session ? (
                <>
                  <li>
                    <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                      My Profile
                    </Link>
                  </li>
                  {session.user.role !== "ADMIN" && (
                    <li>
                      <Link href="/profile?tab=orders" className="text-muted-foreground hover:text-foreground transition-colors">
                        My Orders
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                singason65@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +254 748 088 741              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} KicksZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

