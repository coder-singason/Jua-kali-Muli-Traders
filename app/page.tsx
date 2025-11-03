import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: {
      featured: true,
    },
    include: {
      category: true,
      sizes: true,
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 md:text-6xl">Welcome to KicksZone</h1>
          <p className="text-lg mb-8 md:text-xl text-primary-foreground/90">Premium Shoes for Every Step</p>
          <Link href="/products">
            <Button size="lg" variant="secondary" className="rounded-full px-8">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Link href="/products">
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-lg text-muted-foreground">No featured products yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

