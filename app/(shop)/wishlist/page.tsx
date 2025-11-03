import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Heart } from "lucide-react";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/wishlist");
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: true,
          sizes: true,
          productImages: {
            orderBy: { sortOrder: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl mb-2 flex items-center gap-2">
          <Heart className="h-6 w-6 md:h-8 md:w-8 fill-red-500 text-red-500" />
          My Wishlist
        </h1>
        <p className="text-muted-foreground">
          {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Start adding products you love to your wishlist"
          action={{
            label: "Browse Products",
            href: "/products",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistItems.map((item) => (
            <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}

