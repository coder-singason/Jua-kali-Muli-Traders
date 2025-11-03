import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

// POST /api/orders/[id]/cancel - Cancel an order
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the order with items
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // STRICT VALIDATION: Only PENDING and PROCESSING orders can be cancelled
    // Check in order of priority - most restrictive first
    
    if (order.status === "DELIVERED") {
      return NextResponse.json(
        { error: "Cannot cancel a delivered order. Please contact support for returns or refunds." },
        { status: 400 }
      );
    }

    if (order.status === "SHIPPED") {
      return NextResponse.json(
        { error: "Cannot cancel an order that has been shipped. Please contact support for returns." },
        { status: 400 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Order is already cancelled" },
        { status: 400 }
      );
    }

    // Final check: Only PENDING and PROCESSING can proceed
    if (order.status !== "PENDING" && order.status !== "PROCESSING") {
      return NextResponse.json(
        { error: `Cannot cancel an order with status: ${order.status}. Only PENDING or PROCESSING orders can be cancelled.` },
        { status: 400 }
      );
    }

    // Restore stock for all items in the order
    for (const item of order.items) {
      try {
        await prisma.productSize.update({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.size,
            },
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      } catch (error) {
        // If product size doesn't exist, log but continue
        console.error(`Failed to restore stock for product ${item.productId} size ${item.size}:`, error);
      }
    }

    // Update order status to cancelled
    await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    // Update payment status if exists
    await prisma.payment.updateMany({
      where: {
        orderId: id,
        status: { in: ["PENDING", "COMPLETED"] },
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled successfully and inventory has been restored" 
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}

