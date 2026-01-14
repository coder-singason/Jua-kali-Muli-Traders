import { Suspense } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { ProductFilters } from "@/components/product/ProductFilters";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Search } from "lucide-react";
import Link from "next/link";

async function getProducts(searchParams: {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  brand?: string;
  color?: string;
  material?: string;
  page?: string;
}) {
  const category = searchParams.category;
  const search = searchParams.search;
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;
  const featured = searchParams.featured;
  const brand = searchParams.brand;
  const color = searchParams.color;
  const material = searchParams.material;
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

  if (brand && brand !== "all") {
    where.brand = { contains: brand, mode: "insensitive" };
  }

  if (color && color !== "all") {
    where.color = { contains: color, mode: "insensitive" };
  }

  if (material && material !== "all") {
    where.material = { contains: material, mode: "insensitive" };
  }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          price: true,
          brand: true,
          featured: true,
          images: true,
          color: true,
          material: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          sizes: {
            select: {
              size: true,
              stock: true,
            },
          },
          productImages: {
            select: {
              url: true,
              sortOrder: true,
            },
            orderBy: {
              sortOrder: "asc",
            },
            take: 1, // Only get first image for list view
          },
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
  try {
    const categories = await prisma.category.findMany({
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
    
    // If no top-level categories, try to get all categories (including nested ones)
    if (categories.length === 0) {
      const allCategories = await prisma.category.findMany({
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
      return allCategories.filter(cat => !cat.parentId); // Return only top-level
    }
    
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
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
    brand?: string;
    color?: string;
    material?: string;
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
  if (params.brand) currentParams.set("brand", params.brand);
  if (params.color) currentParams.set("color", params.color);
  if (params.material) currentParams.set("material", params.material);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
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
        <EmptyState
          icon={Search}
          title="No products found"
          description="Try adjusting your search or filters to find what you're looking for"
        />
      ) : (
        <>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product ={product} />
              ))}
            </div>
          </Suspense>

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

