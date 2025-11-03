import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// GET /api/wishlist/check?productId=xxx - Check if product is in wishlist
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ inWishlist: false });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ inWishlist: false });
    }

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    return NextResponse.json({ inWishlist: !!wishlistItem });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json({ inWishlist: false });
  }
}

