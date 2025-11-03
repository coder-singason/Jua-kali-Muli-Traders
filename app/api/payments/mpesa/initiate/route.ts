import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getMpesaService } from "@/lib/payments/mpesa";
import { z } from "zod";

const initiatePaymentSchema = z.object({
  orderId: z.string(),
  phoneNumber: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsedData = initiatePaymentSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsedData.error.errors },
        { status: 400 }
      );
    }

    const { orderId, phoneNumber } = parsedData.data;

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        paymentMethod: "MPESA",
      },
      include: {
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Order is not pending" },
        { status: 400 }
      );
    }

    // Check if payment already exists and is pending
    let payment = order.payments[0];
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: Number(order.total),
          status: "PENDING",
          phoneNumber,
        },
      });
    }

    // Initiate STK Push
    const mpesaService = getMpesaService();
    const callbackUrl = `${process.env.NEXTAUTH_URL}/api/payments/mpesa/callback`;

    const stkResponse = await mpesaService.initiateSTKPush(
      phoneNumber,
      Number(order.total),
      order.orderNumber,
      `Payment for order ${order.orderNumber}`,
      callbackUrl
    );

    // Update payment with transaction ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        mpesaTransactionId: stkResponse.CheckoutRequestID,
      },
    });

    return NextResponse.json({
      success: true,
      message: stkResponse.CustomerMessage,
      checkoutRequestId: stkResponse.CheckoutRequestID,
    });
  } catch (error: any) {
    console.error("Error initiating M-Pesa payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

