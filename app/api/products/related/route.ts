import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/products/related?productId=xxx&categoryId=xxx&limit=4
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    const limit = parseInt(searchParams.get("limit") || "4");

    if (!productId || !categoryId) {
      return NextResponse.json([]);
    }

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        stock: { gt: 0 },
      },
      include: {
        category: true,
        sizes: {
          where: { stock: { gt: 0 } },
        },
        productImages: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      take: limit,
      orderBy: {
        featured: "desc",
        createdAt: "desc",
      },
    });

    const response = NextResponse.json(relatedProducts);

    // Cache related products for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return response;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}

