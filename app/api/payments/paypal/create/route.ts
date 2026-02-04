import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createPayPalOrder } from "@/lib/payments/paypal";

/**
 * POST /api/payments/paypal/create
 * Create a PayPal order for an existing database order
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "Order ID is required" },
                { status: 400 }
            );
        }

        // Fetch the order from database
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Verify the order belongs to the user
        if (order.userId !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Verify payment method is PayPal
        if (order.paymentMethod !== "PAYPAL") {
            return NextResponse.json(
                { error: "Order payment method is not PayPal" },
                { status: 400 }
            );
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const returnUrl = `${appUrl}/orders/${order.id}?success=true&payment=paypal`;
        const cancelUrl = `${appUrl}/orders/${order.id}?canceled=true`;

        // Create PayPal order (amount in USD - you may want to add currency conversion)
        // For now, assuming KSh to USD conversion rate (you should use a proper conversion service)
        const amountInUSD = order.total / 130; // Rough conversion rate

        const paypalOrder = await createPayPalOrder(
            amountInUSD,
            "USD",
            order.orderNumber,
            returnUrl,
            cancelUrl
        );

        // Save PayPal order ID to database
        await prisma.payment.create({
            data: {
                orderId: order.id,
                paypalOrderId: paypalOrder.id,
                amount: order.total,
                status: "PENDING",
            },
        });

        // Get approval URL for redirect
        const approvalUrl = paypalOrder.links?.find(
            (link: any) => link.rel === "approve"
        )?.href;

        return NextResponse.json({
            paypalOrderId: paypalOrder.id,
            approvalUrl,
            message: "PayPal order created successfully",
        });
    } catch (error) {
        console.error("PayPal order creation error:", error);
        return NextResponse.json(
            {
                error: "Failed to create PayPal order",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
