import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ProductActions } from "@/components/admin/ProductActions";

async function getProducts() {
  return await prisma.product.findMany({
    include: {
      category: true,
      sizes: true,
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">No products yet.</p>
            <Link href="/admin/products/new">
              <Button>Add Your First Product</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id}>
              <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      KSh {Number(product.price).toLocaleString()}
                    </p>
                  </div>
                  <ProductActions product={product} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Stock: {product.stock} | Featured: {product.featured ? "Yes" : "No"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

