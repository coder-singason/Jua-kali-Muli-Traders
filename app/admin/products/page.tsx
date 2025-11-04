import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductsList } from "@/components/admin/ProductsList";

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
      sizes: true,
      productImages: {
        orderBy: {
          sortOrder: "asc",
        },
        take: 1, // Only get first image for list view
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function AdminProductsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <ProductsList products={products} />
    </div>
  );
}

