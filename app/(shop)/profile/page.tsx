import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { AddressBook } from "@/components/profile/AddressBook";
import { AdminProfileInfo } from "@/components/profile/AdminProfileInfo";

async function getUserProfile(userId: string, isAdmin: boolean) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: isAdmin
      ? undefined
      : {
          addresses: {
            orderBy: {
              isDefault: "desc",
            },
          },
        },
  });
}

async function getUserOrders(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function getAdminStats() {
  const [totalOrders, totalRevenue, totalProducts, totalCustomers] =
    await Promise.all([
      prisma.order.count({
        where: {
          status: {
            in: ["PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: {
            in: ["PROCESSING", "SHIPPED", "DELIVERED"],
          },
        },
        _sum: {
          total: true,
        },
      }),
      prisma.product.count(),
      prisma.user.count({
        where: {
          role: "USER",
        },
      }),
    ]);

  return {
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.total || 0),
    totalProducts,
    totalCustomers,
  };
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  const isAdmin = session.user.role === "ADMIN";
  const params = await searchParams;

  // For admins, only show profile tab
  // For customers, show all tabs
  const defaultTab = isAdmin
    ? "profile"
    : params.tab === "orders"
    ? "orders"
    : params.tab === "addresses"
    ? "addresses"
    : "profile";

  const [user, orders, adminStats] = await Promise.all([
    getUserProfile(session.user.id, isAdmin),
    isAdmin ? Promise.resolve([]) : getUserOrders(session.user.id),
    isAdmin ? getAdminStats() : Promise.resolve(null),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {isAdmin ? "Admin Profile" : "My Profile"}
      </h1>

      {isAdmin ? (
        // Admin profile - no tabs, just rich profile info
        <AdminProfileInfo user={user} stats={adminStats || undefined} />
      ) : (
        // Customer profile - with tabs
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileInfo
              user={user as typeof user & { addresses: Array<any> }}
            />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderHistory orders={orders} />
          </TabsContent>

          <TabsContent value="addresses" className="space-y-6">
            <AddressBook userId={user.id} addresses={user.addresses || []} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

