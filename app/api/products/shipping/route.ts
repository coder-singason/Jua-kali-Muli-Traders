import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "Product IDs are required" },
        { status: 400 }
      );
    }

    const productIds = idsParam.split(",").filter((id) => id.trim());

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "At least one product ID is required" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, shippingFee: true },
    });

    const shippingFees: Record<string, number> = {};
    products.forEach((product) => {
      shippingFees[product.id] = product.shippingFee || 0;
    });

    return NextResponse.json({ shippingFees });
  } catch (error) {
    console.error("Error fetching shipping fees:", error);
    return NextResponse.json(
      { error: "Failed to fetch shipping fees" },
      { status: 500 }
    );
  }
}

