import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/recently-viewed - Get user's recently viewed products
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json([]);
    }

    const recentlyViewed = await prisma.recentlyViewed.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            category: true,
            sizes: true,
            productImages: {
              orderBy: { sortOrder: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        viewedAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json(recentlyViewed);
  } catch (error) {
    console.error("Error fetching recently viewed:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently viewed" },
      { status: 500 }
    );
  }
}

