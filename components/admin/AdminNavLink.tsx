"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, ShoppingBag, LayoutDashboard, FolderTree } from "lucide-react";

const iconMap = {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
};

interface AdminNavLinkProps {
  href: string;
  iconName: keyof typeof iconMap;
  children: React.ReactNode;
}

export function AdminNavLink({ href, iconName, children }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const Icon = iconMap[iconName];

  return (
    <Link href={href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          isActive && "bg-primary text-primary-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {children}
      </Button>
    </Link>
  );
}

