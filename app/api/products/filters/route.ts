import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// GET /api/products/filters - Get available filter options
export async function GET(request: NextRequest) {
  try {
    // Get distinct brands, colors, and materials
    const [products] = await Promise.all([
      prisma.product.findMany({
        select: {
          brand: true,
          color: true,
          material: true,
        },
        where: {
          brand: { not: null },
          OR: [
            { color: { not: null } },
            { material: { not: null } },
          ],
        },
      }),
    ]);

    // Extract unique values
    const brands = Array.from(
      new Set(products.map((p) => p.brand).filter(Boolean))
    ).sort();
    const colors = Array.from(
      new Set(products.map((p) => p.color).filter(Boolean))
    ).sort();
    const materials = Array.from(
      new Set(products.map((p) => p.material).filter(Boolean))
    ).sort();

    const response = NextResponse.json({
      brands,
      colors,
      materials,
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

