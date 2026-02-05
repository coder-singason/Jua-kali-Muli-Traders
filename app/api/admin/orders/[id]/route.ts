import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import { z } from "zod";

const updateOrderSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]).optional(),
}).refine((data) => data.status || data.paymentStatus, {
  message: "At least one of status or paymentStatus must be provided",
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
      console.error("Validation error:", parsedData.error.errors);
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    // Get current order to check validity
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { status: newStatus, paymentStatus: newPaymentStatus } = parsedData.data;

    // Update operations
    const updatePromises: any[] = [];

    // 1. Handle Order Status Update
    if (newStatus && newStatus !== currentOrder.status) {
      // Prevent updating cancelled orders unless reactivating (not implemented yet)
      if (currentOrder.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Cannot update a cancelled order." },
          { status: 400 }
        );
      }

      // Logic for changing TO Cancelled
      if (newStatus === "CANCELLED") {
        if (currentOrder.status !== "PENDING" && currentOrder.status !== "PROCESSING") {
          return NextResponse.json(
            { error: "Only PENDING or PROCESSING orders can be cancelled." },
            { status: 400 }
          );
        }

        // Restore stock
        for (const item of currentOrder.items) {
          updatePromises.push(
            prisma.productSize.update({
              where: { productId_size: { productId: item.productId, size: item.size } },
              data: { stock: { increment: item.quantity } },
            })
          );
        }
      }

      updatePromises.push(
        prisma.order.update({
          where: { id },
          data: { status: newStatus },
        })
      );

      // Email notification (async, handled after await)
    }

    // 2. Handle Payment Status Update
    if (newPaymentStatus && currentOrder.payments.length > 0) {
      const latestPayment = currentOrder.payments[0];
      if (latestPayment.status !== newPaymentStatus) {
        updatePromises.push(
          prisma.payment.update({
            where: { id: latestPayment.id },
            data: { status: newPaymentStatus },
          })
        );
      }
    } else if (newPaymentStatus && currentOrder.payments.length === 0) {
      // Edge case: No payment record exists yet (e.g. clean COD). 
      // Admin wants to set payment status. Create a record?
      // For simplicity: Create a "Manual Adjustment" payment record.
      updatePromises.push(
        prisma.payment.create({
          data: {
            orderId: id,
            amount: currentOrder.total,
            status: newPaymentStatus,
            // No external IDs since it's manual
          }
        })
      );
    }

    // Execute all updates
    await prisma.$transaction(updatePromises);

    // Fetch updated order to return
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!updatedOrder) throw new Error("Failed to retrieve updated order");

    // Send email if Order Status changed
    if (newStatus && newStatus !== currentOrder.status && currentOrder.user?.email && newStatus !== "PENDING") {
      sendOrderStatusUpdateEmail(
        currentOrder.user.email,
        currentOrder.user.name || "Customer",
        updatedOrder.orderNumber,
        newStatus
      ).catch(e => console.error("Email error:", e));
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error instanceof Error ? error.message : "Unknown" },
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