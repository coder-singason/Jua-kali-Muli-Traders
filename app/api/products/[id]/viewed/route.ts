import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// POST /api/products/[id]/viewed - Track product view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      // Don't track for non-authenticated users
      return NextResponse.json({ success: true });
    }

    const { id } = await params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Upsert recently viewed (update viewedAt if exists, or create new)
    // First, try to update existing record
    const existing = await prisma.recentlyViewed.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: id,
        },
      },
    });

    if (existing) {
      await prisma.recentlyViewed.update({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: id,
          },
        },
        data: {
          viewedAt: new Date(),
        },
      });
    } else {
      await prisma.recentlyViewed.create({
        data: {
          userId: session.user.id,
          productId: id,
          viewedAt: new Date(),
        },
      });
    }

    // Keep only last 20 recently viewed items per user
    const allRecent = await prisma.recentlyViewed.findMany({
      where: { userId: session.user.id },
      orderBy: { viewedAt: "desc" },
    });

    if (allRecent.length > 20) {
      const toDelete = allRecent.slice(20);
      await prisma.recentlyViewed.deleteMany({
        where: {
          id: { in: toDelete.map((item) => item.id) },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking product view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}

