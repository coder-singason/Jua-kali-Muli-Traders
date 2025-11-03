import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateOrderNumber } from "@/lib/utils/order";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      size: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
      productName: z.string(),
    })
  ),
  shippingAddress: z.object({
    fullName: z.string(),
    phone: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    postalCode: z.string().optional(),
  }),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "MPESA"]),
  phone: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent admins from placing orders
    if (session.user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Administrators cannot place orders. Please use a customer account." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedData = createOrderSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { items, shippingAddress, paymentMethod, phone } = parsedData.data;

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 500;
    const total = subtotal + shippingCost;

    // Validate stock availability and deduct stock before creating order
    for (const item of items) {
      const productSize = await prisma.productSize.findUnique({
        where: {
          productId_size: {
            productId: item.productId,
            size: item.size,
          },
        },
      });

      if (!productSize) {
        return NextResponse.json(
          { error: `Size ${item.size} not available for this product` },
          { status: 400 }
        );
      }

      if (productSize.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.productName} (Size: ${item.size}). Available: ${productSize.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // Deduct stock for all items
    const stockUpdates: Array<{ productId: string; size: string; quantity: number }> = [];
    try {
      for (const item of items) {
        await prisma.productSize.update({
          where: {
            productId_size: {
              productId: item.productId,
              size: item.size,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
        stockUpdates.push({ productId: item.productId, size: item.size, quantity: item.quantity });
      }

      // Get user info for email
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true },
      });

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: session.user.id,
          orderNumber: generateOrderNumber(),
          status: "PENDING",
          total,
          subtotal,
          shippingCost,
          paymentMethod,
          shippingAddress: shippingAddress as any,
          phone,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // If M-Pesa payment, create payment record
      if (paymentMethod === "MPESA") {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: total,
            status: "PENDING",
            phoneNumber: phone,
          },
        });
      }

      // Send order confirmation email (non-blocking)
      if (user?.email) {
        sendOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          customerName: user.name || "Customer",
          customerEmail: user.email,
          items: items.map((item) => ({
            name: item.productName,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shippingCost,
          total,
          shippingAddress,
          paymentMethod: paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : "M-Pesa",
          orderDate: order.createdAt,
        }).catch((error) => {
          console.error("Failed to send order confirmation email:", error);
          // Don't fail the request if email fails
        });
      }

      return NextResponse.json({ order }, { status: 201 });
    } catch (error) {
      // Rollback stock if order creation failed
      console.error("Error creating order, rolling back stock:", error);
      for (const update of stockUpdates) {
        try {
          await prisma.productSize.update({
            where: {
              productId_size: {
                productId: update.productId,
                size: update.size,
              },
            },
            data: {
              stock: {
                increment: update.quantity,
              },
            },
          });
        } catch (rollbackError) {
          console.error(`Failed to rollback stock for ${update.productId} size ${update.size}:`, rollbackError);
        }
      }
      throw error;
    }

  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admins don't have orders
    if (session.user.role === "ADMIN") {
      return NextResponse.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

