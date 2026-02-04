import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/products/filters - Get available filter options
export async function GET(request: NextRequest) {
  try {
    // Get distinct brands for electronics/appliances
    const [products] = await Promise.all([
      prisma.product.findMany({
        select: {
          brand: true,
        },
        where: {
          brand: { not: null },
        },
      }),
    ]);

    // Extract unique values
    const brands = Array.from(
      new Set(products.map((p) => p.brand).filter(Boolean))
    ).sort();

    const response = NextResponse.json({
      brands,
    });

    // Cache filter options for 15 minutes
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=900, stale-while-revalidate=1800"
    );

    return response;
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}

