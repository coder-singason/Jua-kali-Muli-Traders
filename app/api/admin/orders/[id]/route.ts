import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { z } from "zod";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsedData = updateOrderSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    // Get current order to check if status is changing
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Prevent updating cancelled orders
    if (currentOrder.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot update a cancelled order. Cancelled orders are final." },
        { status: 400 }
      );
    }

    const newStatus = parsedData.data.status;
    const statusChanged = currentOrder.status !== newStatus;

    // FIX: Removed '&& currentOrder.status !== "CANCELLED"' because the early return 
    // above ensures currentOrder.status is NOT "CANCELLED" by this point.
    if (newStatus === "CANCELLED") {
      // Only allow cancellation if order is PENDING or PROCESSING
      if (currentOrder.status !== "PENDING" && currentOrder.status !== "PROCESSING") {
        return NextResponse.json(
          { error: `Cannot cancel an order with status: ${currentOrder.status}. Only PENDING or PROCESSING orders can be cancelled.` },
          { status: 400 }
        );
      }

      // Restore stock when cancelling
      for (const item of currentOrder.items) {
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
          console.error(`Failed to restore stock for product ${item.productId} size ${item.size}:`, error);
        }
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Send status update email if status changed and user has email (non-blocking)
    if (statusChanged && currentOrder.user?.email && newStatus !== "PENDING") {
      // Don't await - send email asynchronously
      sendOrderStatusUpdateEmail(
        currentOrder.user.email,
        currentOrder.user.name || "Customer",
        order.orderNumber,
        newStatus
      ).catch((error) => {
        console.error("Failed to send order status update email:", error);
        // Don't fail the request if email fails
      });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error updating order:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to update order", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}