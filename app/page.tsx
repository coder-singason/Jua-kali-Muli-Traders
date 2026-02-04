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
      productImages: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1,
      },
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
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground py-20 md:py-32 overflow-hidden">
        {/* Blob Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-foreground/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-primary-foreground/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-foreground/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 md:text-6xl">Welcome to JUA-KALI MULI TRADERS</h1>
          <p className="text-lg text-foreground/90 mb-8 md:text-xl font-medium">
            Quality Electronics, Home Appliances & Juakali Tools in Murang'a
          </p>
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

