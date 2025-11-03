import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { AdminNavLink } from "@/components/admin/AdminNavLink";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64">
            <nav className="space-y-2">
              <AdminNavLink href="/admin/dashboard" iconName="LayoutDashboard">
                Dashboard
              </AdminNavLink>
              <AdminNavLink href="/admin/products" iconName="Package">
                Products
              </AdminNavLink>
              <AdminNavLink href="/admin/orders" iconName="ShoppingBag">
                Orders
              </AdminNavLink>
              <AdminNavLink href="/admin/categories" iconName="Settings">
                Categories
              </AdminNavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
