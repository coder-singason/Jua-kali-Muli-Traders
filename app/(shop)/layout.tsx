"use client";

import { usePathname } from "next/navigation";
import { CustomerSidebar } from "@/components/layout/CustomerSidebar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Don't show sidebar on admin pages or checkout
  const hideSidebar = pathname?.startsWith("/admin") || pathname?.startsWith("/checkout");
  
  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Customer Sidebar */}
      <CustomerSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Spacer for Mobile Menu Button */}
        <div className="h-16 lg:hidden" />
        
        {/* Main Content */}
        <main className="flex-1 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

