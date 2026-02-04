import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { capturePayPalOrder } from "@/lib/payments/paypal";

/**
 * POST /api/payments/paypal/capture
 * Capture a PayPal order after user approval
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { paypalOrderId } = body;

        if (!paypalOrderId) {
            return NextResponse.json(
                { error: "PayPal Order ID is required" },
                { status: 400 }
            );
        }

        // Find the payment record
        const payment = await prisma.payment.findUnique({
            where: { paypalOrderId },
            include: { order: true },
        });

        if (!payment) {
            return NextResponse.json(
                { error: "Payment record not found" },
                { status: 404 }
            );
        }

        // Verify the payment belongs to the user
        if (payment.order.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Capture the PayPal order
        const captureData = await capturePayPalOrder(paypalOrderId);

        // Extract payer ID and payment ID from capture data
        const payerId = captureData.payer?.payerId || null;
        const paymentId =
            captureData.purchaseUnits?.[0]?.payments?.captures?.[0]?.id || null;

        // Update payment record
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: "COMPLETED",
                paypalPayerId: payerId,
                paypalPaymentId: paymentId,
                paypalCapture: captureData as any,
            },
        });

        // Update order status
        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "PROCESSING" },
        });

        return NextResponse.json({
            success: true,
            message: "Payment captured successfully",
            orderId: payment.orderId,
        });
    } catch (error) {
        console.error("PayPal capture error:", error);
        return NextResponse.json(
            {
                error: "Failed to capture PayPal payment",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
