import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { generateOrderNumber } from "@/lib/utils/order";
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

    return NextResponse.json({ order }, { status: 201 });
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

