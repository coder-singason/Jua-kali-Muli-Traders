"use client";

import { usePathname } from "next/navigation";
import { CustomerSidebar } from "@/components/layout/CustomerSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import { cn } from "@/lib/utils";

function ShopLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  
  // Don't show sidebar on admin pages only
  const hideSidebar = pathname?.startsWith("/admin");
  
  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Customer Sidebar - Fixed, doesn't scroll */}
      <CustomerSidebar />

      {/* Main Content Area - Account for fixed sidebar width on desktop */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isCollapsed ? "lg:ml-16" : "lg:ml-64" // Collapsed: 64px, Expanded: 256px
        )}
      >
        {/* Top Spacer for Mobile Menu Button */}
        <div className="h-16 lg:hidden" />
        
        {/* Main Content - Scrollable */}
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ShopLayoutContent>{children}</ShopLayoutContent>
    </SidebarProvider>
  );
}

