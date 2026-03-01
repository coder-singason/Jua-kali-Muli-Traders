import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductImageViewer } from "@/components/product/ProductImageViewer";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductViewTracker } from "@/components/product/ProductViewTracker";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { Package, Star, Truck, Shield, Heart } from "lucide-react";
import { ProductImageFallback } from "@/components/ui/product-image-fallback";
import Link from "next/link";

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        sizes: {
          orderBy: {
            size: "asc",
          },
        },
        productImages: {
          orderBy: {
            sortOrder: "asc",
          },
        },
        productDetails: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const totalStock = product.sizes.length > 0
    ? product.sizes.reduce((sum, size) => sum + size.stock, 0)
    : product.stock;

  const availableSizes = product.sizes.filter((size) => size.stock > 0);

  return (
    <>
      <ProductViewTracker productId={product.id} />
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground transition-colors">
              Products
            </Link>
            <span>/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </nav>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-3 md:space-y-4">
            {product.productImages && product.productImages.length > 0 ? (
              <ProductImageViewer
                images={product.productImages}
                productName={product.name}
                featured={product.featured}
              />
            ) : product.images && product.images.length > 0 ? (
              // Fallback to legacy images array
              <>
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <ProductImageFallback className="w-full h-full" size="lg" />
                  )}
                  {product.featured && (
                    <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {product.images.slice(1, 5).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted border-2 border-transparent hover:border-primary transition-colors cursor-pointer"
                      >
                        <Image
                          src={image}
                          alt={`${product.name} ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold md:text-3xl mb-2 font-sf-pro">{product.name}</h1>
                  {product.brand && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Package className="h-4 w-4" />
                      <span>{product.brand}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Category: {product.category.name}</span>
                    {product.sku && (
                      <>
                        <span>•</span>
                        <span>SKU: {product.sku}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-bold md:text-4xl font-sf-pro">
                KSh {Number(product.price).toLocaleString()}
              </p>
              {product.featured && (
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  Featured
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4 text-sm">
              {totalStock > 0 ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="h-2 w-2 rounded-full bg-current"></div>
                  <span className="font-medium">In Stock ({totalStock} available)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-destructive">
                  <div className="h-2 w-2 rounded-full bg-current"></div>
                  <span className="font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Features */}
            {(product.deliveryTime || product.warranty || product.quality) && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {product.deliveryTime && (
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="text-sm font-medium">{product.deliveryTime}</p>
                    </div>
                  </div>
                )}
                {product.warranty && (
                  <div className="flex items-center gap-2 rounded-lg border p-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Warranty</p>
                      <p className="text-sm font-medium">{product.warranty}</p>
                    </div>
                  </div>
                )}
                {product.quality && (
                  <div className={`flex items-center gap-2 rounded-lg border p-3 ${!product.deliveryTime && !product.warranty ? 'col-span-2 md:col-span-1' : product.deliveryTime && product.warranty ? 'col-span-2 md:col-span-1' : ''}`}>
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Quality</p>
                      <p className="text-sm font-medium">{product.quality}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add to Cart Section */}
            <ProductDetailClient product={product} />

            {/* Description */}
            {product.description && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h2 className="mb-3 text-lg font-semibold">Product Description</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Product Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-base font-semibold">Product Information</h3>
                <div className="space-y-2 text-sm">
                  {product.productDetails && product.productDetails.length > 0 ? (
                    // Use dynamic product details
                    product.productDetails.map((detail) => (
                      <div key={detail.id} className="flex justify-between">
                        <span className="text-muted-foreground">{detail.label}:</span>
                        <span className="font-medium">{detail.value}</span>
                      </div>
                    ))
                  ) : (
                    // Fallback to default fields
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Brand:</span>
                        <span className="font-medium">{product.brand || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{product.category.name}</span>
                      </div>
                      {product.sku && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SKU:</span>
                          <span className="font-medium">{product.sku}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available Sizes:</span>
                        <span className="font-medium">
                          {availableSizes.map((s) => s.size).join(", ")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews & Ratings */}
            <div className="mt-6">
              <ProductReviews productId={product.id} />
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts
            productId={product.id}
            categoryId={product.categoryId}
            limit={4}
          />
        </div>

        {/* Recently Viewed */}
        <div className="mt-12">
          <RecentlyViewed currentProductId={product.id} limit={4} />
        </div>
      </div>
    </>
  );
}

