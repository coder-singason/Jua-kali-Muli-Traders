import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

async function getProducts(searchParams: {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  page?: string;
}) {
  const category = searchParams.category;
  const search = searchParams.search;
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;
  const featured = searchParams.featured;
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (category) {
    where.category = {
      slug: category,
    };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) {
      where.price.gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      where.price.lte = parseFloat(maxPrice);
    }
  }

  if (featured === "true") {
    where.featured = true;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        sizes: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, totalPages: Math.ceil(total / limit) };
}

async function getCategories() {
  return await prisma.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: {
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    featured?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const [productsData, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);
  const { products, total, page, totalPages } = productsData;

  // Build current URL params for pagination (preserve filters)
  const currentParams = new URLSearchParams();
  if (params.search) currentParams.set("search", params.search);
  if (params.category) currentParams.set("category", params.category);
  if (params.minPrice) currentParams.set("minPrice", params.minPrice);
  if (params.maxPrice) currentParams.set("maxPrice", params.maxPrice);
  if (params.featured) currentParams.set("featured", params.featured);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Products</h1>
        <p className="text-muted-foreground">
          {total} {total === 1 ? "product" : "products"} found
        </p>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <ProductFilters categories={categories} />
      </Suspense>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No products found.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/products?${currentParams.toString()}&page=${page - 1}`}
                  className="rounded px-4 py-2 bg-secondary hover:bg-secondary/80"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  // Show first, last, current, and pages around current
                  return (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  );
                })
                .map((pageNum, index, array) => {
                  // Add ellipsis if needed
                  const showEllipsisBefore = index > 0 && pageNum - array[index - 1] > 1;
                  return (
                    <div key={pageNum} className="flex items-center gap-2">
                      {showEllipsisBefore && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Link
                        href={`/products?${currentParams.toString()}&page=${pageNum}`}
                        className={`rounded px-4 py-2 transition-colors ${
                          pageNum === page
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    </div>
                  );
                })}
              {page < totalPages && (
                <Link
                  href={`/products?${currentParams.toString()}&page=${page + 1}`}
                  className="rounded px-4 py-2 bg-secondary hover:bg-secondary/80"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

